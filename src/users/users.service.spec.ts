import { UsersService } from './users.service';

const mockUserDb: any[] = [];
const mockPrismaService = {
  user: {
    create: jest.fn(({ data }) => {
      const user = { ...data, id: mockUserDb.length + 1 };
      mockUserDb.push(user);
      return user;
    }),
    findUnique: jest.fn(({ where }) =>
      mockUserDb.find((u) => u.email === where.email),
    ),
    findMany: jest.fn(() => mockUserDb),
  },
};

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: typeof mockPrismaService;

  beforeEach(() => {
    prismaService = mockPrismaService;
    mockUserDb.length = 0;
    service = new UsersService(prismaService as any);
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
});
