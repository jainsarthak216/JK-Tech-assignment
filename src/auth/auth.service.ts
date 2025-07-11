/* eslint-disable */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService, User } from '../users/users.service';
import { RegisterDto } from './dto/register.dto/register.dto';
import { LoginDto } from './dto/login.dto/login.dto';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = this.usersService.findByEmail(email);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async register(dto: RegisterDto): Promise<{ access_token: string }> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.usersService.create({
      email: dto.email,
      password: hashedPassword,
      role: 'viewer',
    });

    const payload = { email: user.email, sub: user.id, role: user.role };
    const access_token = await this.jwtService.signAsync(payload);

    return { access_token };
  }

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    const user = this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { email: user.email, sub: user.id, role: user.role };
    const access_token = await this.jwtService.signAsync(payload);
    return { access_token };
  }
}
