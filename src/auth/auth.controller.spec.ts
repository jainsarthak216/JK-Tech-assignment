import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';
import { UnauthorizedException } from '@nestjs/common';

const mockAuthService = {
  register: jest.fn((email, password, role) => ({
    email,
    id: '1',
    role,
  })),
  validateUser: jest.fn((email, password) =>
    email === 'valid@example.com' && password === '1234'
      ? { email, id: '1', role: 'viewer' }
      : null,
  ),
  jwtService: {
    signAsync: jest.fn(() => 'mocked_token'),
  },
};

const mockRequest = {
  user: { email: 'valid@example.com', id: '1', role: 'viewer' },
  headers: { authorization: 'Bearer mocked_token' },
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
      .overrideProvider(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register and return access token', async () => {
    const result = await controller.register({
      email: 'new@example.com',
      password: 'pass',
      role: 'viewer',
    });
    expect(result).toHaveProperty('access_token', 'mocked_token');
    expect(mockAuthService.register).toHaveBeenCalledWith(
      'new@example.com',
      'pass',
      'viewer',
    );
  });

  it('should login and return access token for valid user', async () => {
    const result = await controller.login({
      email: 'valid@example.com',
      password: '1234',
    });
    expect(result).toHaveProperty('access_token', 'mocked_token');
    expect(mockAuthService.validateUser).toHaveBeenCalledWith(
      'valid@example.com',
      '1234',
    );
  });

  it('should throw UnauthorizedException for invalid login', async () => {
    await expect(
      controller.login({ email: 'invalid@example.com', password: 'wrong' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should return user profile', () => {
    const result = controller.getProfile(mockRequest);
    expect(result).toEqual(mockRequest.user);
  });

  it('should logout and return message', () => {
    const result = controller.logout(mockRequest);
    expect(result).toEqual({ message: 'Logged out' });
  });
});
