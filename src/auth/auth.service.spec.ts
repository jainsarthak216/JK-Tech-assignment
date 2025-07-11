import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;

  beforeEach(() => {
    usersService = new UsersService();
    service = new AuthService(
      usersService,
      new JwtService({
        secret: 'test_secret',
        signOptions: { expiresIn: '1h' },
      }),
    );
  });

  it('should register and return user with token', async () => {
    const user = await service.register({
      email: 'test@example.com',
      password: '1234',
    });
    expect(user.access_token).toBeDefined();
  });

  it('should login valid user', async () => {
    await service.register({ email: 'test@example.com', password: '1234' });
    const user = await service.login({
      email: 'test@example.com',
      password: '1234',
    });
    expect(user.access_token).toBeDefined();
  });

  it('should throw on invalid login', async () => {
    await expect(
      service.login({ email: 'unknown@example.com', password: 'pass' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
