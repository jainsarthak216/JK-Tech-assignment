/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';

const mockUsers = [
  { email: 'a@b.com', password: 'abc', role: 'viewer' },
  { email: 'b@b.com', password: 'xyz', role: 'admin' },
  { email: 'test@example.com', password: 'pass', role: 'viewer' },
];

const mockUsersService = {
  create: jest.fn((user) => mockUsers.push(user)),
  findAll: jest.fn(() => mockUsers),
  getAllUsers: jest.fn(() => mockUsers),
  getUserByEmail: jest.fn((email) => {
    const found = mockUsers.find((u) => u.email === email);
    return found ? found : null;
  }),
  findByEmail: jest.fn(async (email) => {
    return email === 'test@example.com'
      ? { email: 'test@example.com', id: '1', role: 'viewer' }
      : null;
  }),
};
const mockAuthGuard = {
  canActivate: () => true,
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    })
      .overrideProvider(JwtAuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should return all users', () => {
    controller.getAllUsers();
    const users = controller.getAllUsers();
    expect(users.length).toBeGreaterThanOrEqual(2);
  });

  it('should return a user by email', () => {
    controller.getAllUsers();
    const user = controller.getUserByEmail('test@example.com');
    expect(user?.email).toBe('test@example.com');
  });

  it('should return null for missing user', () => {
    const user = controller.getUserByEmail('missing@example.com');
    expect(user).toBeNull();
  });
});
