import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        UsersService,
        {
          provide: JwtService,
          useValue: new JwtService({
            secret: 'test_secret',
            signOptions: { expiresIn: '1h' },
          }),
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should register and return access_token', async () => {
    const result = await controller.register({
      email: 'a@b.com',
      password: 'abc',
    });
    expect(result.access_token).toBeDefined();
  });

  it('should login and return access_token', async () => {
    await controller.register({ email: 'a@b.com', password: 'abc' });
    const result = await controller.login({
      email: 'a@b.com',
      password: 'abc',
    });
    expect(result.access_token).toBeDefined();
  });
});
