/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';

const mockAuthGuard = {
  canActivate: () => true,
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    })
      .overrideProvider(JwtAuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should return all users', () => {
    service.create({ email: 'a@b.com', password: 'abc', role: 'viewer' });
    service.create({ email: 'b@b.com', password: 'xyz', role: 'admin' });

    const users = controller.getAllUsers();
    expect(users.length).toBeGreaterThanOrEqual(2);
  });

  it('should return a user by email', () => {
    service.create({
      email: 'test@example.com',
      password: 'pass',
      role: 'admin',
    });
    const user = controller.getUserByEmail('test@example.com');
    expect(user.email).toBe('test@example.com');
  });

  it('should return undefined for missing user', () => {
    const user = controller.getUserByEmail('missing@example.com');
    expect(user).toBeUndefined();
  });
});
