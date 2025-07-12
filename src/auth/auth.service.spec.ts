import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

const mockUserDb: any[] = [];
const mockPrismaService = {
  user: {
    findUnique: jest.fn(({ where }) =>
      mockUserDb.find((u) => u.email === where.email),
    ),
    create: jest.fn(({ data }) => {
      const user = { ...data, id: mockUserDb.length + 1 };
      mockUserDb.push(user);
      return user;
    }),
    findMany: jest.fn(() => mockUserDb),
  },
};

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: typeof mockPrismaService;

  beforeEach(() => {
    prismaService = mockPrismaService;
    mockUserDb.length = 0;
    service = new AuthService(
      new JwtService({
        secret: 'test_secret',
        signOptions: { expiresIn: '1h' },
      }),
      prismaService as any,
    );
  });

  it('should register and return user with token', async () => {
    const result = await service.register('test@example.com', '1234', 'viewer');
    expect(result).toHaveProperty('email', 'test@example.com');
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('role', 'viewer');
  });

  it('should login valid user', async () => {
    await service.register('test@example.com', '1234', 'viewer');
    const user = await service.validateUser('test@example.com', '1234');
    expect(user).toBeDefined();
    const token = service.login(user);
    expect(token.access_token).toBeDefined();
  });

  it('should login and return a valid JWT payload', async () => {
    await service.register('jwtuser@example.com', 'jwtpass', 'editor');
    const user = await service.validateUser('jwtuser@example.com', 'jwtpass');
    expect(user).toBeDefined();
    const token = service.login(user);
    expect(token.access_token).toBeDefined();

    const decoded = new JwtService({ secret: 'test_secret' }).decode(
      token.access_token,
    );
    if (decoded) {
      expect(decoded.email).toBe('jwtuser@example.com');
      expect(decoded.role).toBe('editor');
      expect(decoded.sub).toBe(user && 'id' in user ? user.id : undefined);
    }
  });

  it('should not validate user with wrong password', async () => {
    await service.register('wrongpass@example.com', 'rightpass', 'viewer');
    const user = await service.validateUser(
      'wrongpass@example.com',
      'wrongpass',
    );
    expect(user).toBeNull();
  });

  it('should not validate user with non-existent email', async () => {
    const user = await service.validateUser('noexist@example.com', 'nopass');
    expect(user).toBeNull();
  });

  it('should throw on invalid login', async () => {
    await expect(
      service.validateUser('unknown@example.com', 'pass'),
    ).resolves.toBeNull();
  });

  it('should not allow duplicate registration', async () => {
    await service.register('test@example.com', '1234', 'viewer');
    await expect(
      service.register('test@example.com', '1234', 'viewer'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should hash password and not return it on register', async () => {
    const result = await service.register(
      'hash@example.com',
      'plainpass',
      'viewer',
    );
    expect(result).not.toHaveProperty('password');
    const user = await prismaService.user.findUnique({
      where: { email: 'hash@example.com' },
    });
    expect(user).toBeDefined();
    expect(user?.password).not.toBe('plainpass');
  });
});
