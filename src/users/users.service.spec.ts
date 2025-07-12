import { UsersService } from './users.service';

type User = {
  id: string;
  email: string;
  password: string;
  role: string;
  createdAt: Date;
};

const mockUserDb: User[] = [];
const mockPrismaService = {
  user: {
    create: jest.fn(
      ({
        data,
      }: {
        data: { email: string; password: string; role: string };
      }) => {
        const user: User = {
          email: data.email,
          password: data.password,
          role: data.role,
          id: (mockUserDb.length + 1).toString(),
          createdAt: new Date(),
        };
        mockUserDb.push(user);
        return user;
      },
    ),
    findUnique: jest.fn(
      ({ where }: { where: { email?: string; id?: string } }) => {
        if (where.email !== undefined) {
          return mockUserDb.find((u) => u.email === where.email);
        }
        if (where.id !== undefined) {
          return mockUserDb.find((u) => u.id === where.id);
        }
        return undefined;
      },
    ),
    findMany: jest.fn(
      ({ select }: { select?: { [K in keyof User]?: boolean } } = {}) => {
        if (select) {
          return mockUserDb.map((u) => {
            const selected: { [key: string]: unknown } = {};
            Object.keys(select).forEach((key) => {
              if (select[key as keyof User])
                selected[key] = u[key as keyof User];
            });
            return selected;
          });
        }
        return mockUserDb;
      },
    ),
    update: jest.fn(
      ({ where, data }: { where: { id: string }; data: { role: string } }) => {
        const user = mockUserDb.find((u) => u.id === where.id);
        if (!user) return undefined;
        user.role = data.role;
        return user;
      },
    ),
  },
};

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: typeof mockPrismaService;

  beforeEach(() => {
    prismaService = mockPrismaService;
    mockUserDb.length = 0;
    service = new UsersService(prismaService as unknown as any);
  });

  it('should create and return a user', async () => {
    const user = await service.create({
      email: 'test@example.com',
      password: 'secret',
      role: 'viewer',
    });
    expect(user.email).toBe('test@example.com');
    expect(user.password).toBeDefined(); // password should be hashed
    expect(user.role).toBe('viewer');
  });

  it('should create a user with default role if not provided', async () => {
    const user = await service.create({
      email: 'defaultrole@example.com',
      password: 'secret',
    });
    expect(user.email).toBe('defaultrole@example.com');
    expect(user.role).toBe('viewer');
  });

  it('should find user by email', async () => {
    await service.create({
      email: 'test@example.com',
      password: 'secret',
      role: 'admin',
    });
    const found = await service.findByEmail('test@example.com');
    expect(found).toBeDefined();
  });

  it('should return undefined for non-existing email', async () => {
    const found = await service.findByEmail('missing@example.com');
    expect(found).toBeUndefined();
  });

  it('should return all users with selected fields', async () => {
    await service.create({ email: 'a@b.com', password: 'abc', role: 'viewer' });
    await service.create({ email: 'b@b.com', password: 'xyz', role: 'admin' });
    // Simulate the service method that wraps prisma.user.findMany with select
    const users = await service.findAll();
    expect(users.length).toBe(2);
    expect(users[0]).toHaveProperty('id');
    expect(users[0]).toHaveProperty('email');
    expect(users[0]).toHaveProperty('role');
    expect(users[0]).toHaveProperty('createdAt');
  });

  it('should update user role', async () => {
    const user = await service.create({
      email: 'role@b.com',
      password: 'abc',
      role: 'viewer',
    });
    const updated = await service.updateRole(user.id, 'admin');
    expect(updated.role).toBe('admin');
  });

  it('should throw NotFoundException when updating role for missing user', async () => {
    await expect(service.updateRole('999', 'admin')).rejects.toThrow(
      'User not found',
    );
  });
});
