import { JwtStrategy } from './jwt.strategy';
import { ExtractJwt, Strategy } from 'passport-jwt';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    strategy = new JwtStrategy();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should call PassportStrategy constructor with correct options', () => {
    jest.mock('passport-jwt', () => ({
      ExtractJwt: {
        fromAuthHeaderAsBearerToken: jest.fn(() => 'mockedExtractor'),
      },
      Strategy: jest.fn(),
    }));
    const instance = new JwtStrategy();
    expect(instance).toBeInstanceOf(JwtStrategy);
    expect(ExtractJwt.fromAuthHeaderAsBearerToken).toBeDefined();
  });

  it('should validate and return correct payload', () => {
    const payload = { sub: '123', email: 'test@example.com', role: 'admin' };
    const result = strategy.validate(payload);
    expect(result).toEqual({
      userId: '123',
      email: 'test@example.com',
      role: 'admin',
    });
  });

  it('should handle missing role in payload', () => {
    const payload = { sub: '456', email: 'user@example.com', role: 'viewer' };
    const result = strategy.validate(payload);
    expect(result).toEqual({
      userId: '456',
      email: 'user@example.com',
      role: 'viewer',
    });
  });
});
