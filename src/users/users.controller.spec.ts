/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';

const mockUsers = [
  { email: 'a@b.com', password: 'abc', role: 'viewer', id: '1' },
  { email: 'b@b.com', password: 'xyz', role: 'admin', id: '2' },
  { email: 'test@example.com', password: 'pass', role: 'viewer', id: '3' },
];

const mockUsersService = {
  create: jest.fn((user) => mockUsers.push(user)),
  findAll: jest.fn(() => mockUsers),
  getAllUsers: jest.fn(() => mockUsers),
  getUserByEmail: jest.fn((email) => {
    const found = mockUsers.find((u) => u.email === email);
    if (found && Object.keys(found).length > 0) {
      return found;
    }
    return null;
  }),
  findByEmail: jest.fn(async (email) => {
    return email === 'test@example.com'
      ? { email: 'test@example.com', id: '1', role: 'viewer' }
      : null;
  }),
  updateRole: jest.fn((id, role) => {
    const found = mockUsers.find((u) => u.id === id);
    if (found) {
      found.role = role;
      return found;
    }
    return null;
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

  it('should return a user by email', async () => {
    controller.getAllUsers();
    const user = await controller.getUserByEmail('test@example.com');
    expect(user?.email).toBe('test@example.com');
  });

  it('should return null for missing user', async () => {
    const user = await controller.getUserByEmail('missing@example.com');
    expect(user).toBeNull();
  });

  it('should update user role', async () => {
    const user = { email: 'role@b.com', password: 'abc', role: 'viewer', id: '2' };
    mockUsers.push(user);
    mockUsersService.updateRole = jest.fn((id, role) => {
      const found = mockUsers.find((u) => u.id === id);
      if (found) {
        found.role = role;
        return found;
      }
      return null;
    });
    // Act
    const updateRoleDto = { role: 'admin' };
    const updated = await controller['usersService'].updateRole(user.id, updateRoleDto.role);
    // Assert
    expect(updated.role).toBe('admin');
    expect(mockUsersService.updateRole).toHaveBeenCalledWith(user.id, 'admin');
  });
});
