import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

export interface User {
  id: string;
  email: string;
  password: string;
  role: 'admin' | 'editor' | 'viewer';
}

@Injectable()
export class UsersService {
  private readonly users: User[] = [];

  create(userDto: Partial<User>): User {
    const user: User = {
      id: uuid(),
      email: userDto.email!,
      password: userDto.password!,
      role: userDto.role || 'viewer',
    };
    this.users.push(user);
    return user;
  }

  findByEmail(email: string): User | undefined {
    return this.users.find((user) => user.email === email);
  }

  findAll(): User[] {
    return this.users;
  }

  updateRole(id: string, role: User['role']): User {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new NotFoundException('User not found');
    user.role = role;
    return user;
  }
}
