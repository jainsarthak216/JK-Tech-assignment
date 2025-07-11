import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(() => {
    service = new UsersService();
  });

  it('should create and return a user', () => {
    const user = service.create({
      email: 'test@example.com',
      password: 'secret',
      role: 'viewer',
    });
    expect(user.email).toBe('test@example.com');
    expect(user.password).toBe('secret');
    expect(user.role).toBe('viewer');
  });

  it('should find user by email', () => {
    service.create({
      email: 'test@example.com',
      password: 'secret',
      role: 'admin',
    });
    const found = service.findByEmail('test@example.com');
    expect(found).toBeDefined();
  });

  it('should return undefined for non-existing email', () => {
    const found = service.findByEmail('missing@example.com');
    expect(found).toBeUndefined();
  });
});
