import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/enums/role.enum';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(async () => 'hashed'),
  compare: jest.fn(async () => true),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: any;
  let jwtService: any;
  let prisma: any;
  let config: any;

  beforeEach(() => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findOrThrow: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
      decode: jest.fn(),
    } as any;

    prisma = {
      refreshToken: {
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        create: jest.fn(),
      },
    };

    config = {
      get: jest.fn((key: string, def: any) => def),
    } as any;

    service = new AuthService(usersService, jwtService, prisma, config);
  });

  describe('register', () => {
    it('throws when email already exists', async () => {
      usersService.findByEmail.mockResolvedValue({ id: 'u-1' });

      await expect(
        service.register({
          email: 'a@b.com',
          password: 'pass1234',
          name: 'A',
          role: Role.ADMIN,
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws when WARUNG role missing warungId', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.register({
          email: 'w@b.com',
          password: 'pass1234',
          name: 'W',
          role: Role.WARUNG,
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('hashes password and creates user on success', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue({
        id: 'u-1',
        email: 'a@b.com',
        name: 'A',
        role: Role.ADMIN,
        warungId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.register({
        email: 'a@b.com',
        password: 'pass1234',
        name: 'A',
        role: Role.ADMIN,
      } as any);

      expect(bcrypt.hash as any as jest.Mock).toHaveBeenCalled();
      expect(usersService.create).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 'u-1');
      expect((result as any).password).toBeUndefined();
    });
  });

  describe('login', () => {
    it('throws when user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'x@x.com', password: 'x' } as any),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws when password invalid', async () => {
      (bcrypt.compare as any as jest.Mock).mockResolvedValue(false);
      usersService.findByEmail.mockResolvedValue({
        id: 'u-1',
        email: 'x@x.com',
        password: 'hash',
        role: Role.ADMIN,
      });

      await expect(
        service.login({ email: 'x@x.com', password: 'wrong' } as any),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
