/* eslint-disable */
import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

export interface User {
  id: string;
  email: string;
  password: string;
  role: 'admin' | 'editor' | 'viewer';
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userDto: { email: string; password: string; role?: string }) {
    const hashedPassword = await bcrypt.hash(userDto.password, 10);
    return this.prisma.user.create({
      data: {
        email: userDto.email,
        password: hashedPassword,
        role: userDto.role ?? 'viewer',
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, role: true, createdAt: true },
    });
  }

  async updateRole(id: string, role: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({ where: { id }, data: { role } });
  }
}
