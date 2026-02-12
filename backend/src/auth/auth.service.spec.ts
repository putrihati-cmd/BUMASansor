import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            findOrThrow: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            refreshToken: {
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('token'),
            decode: jest.fn().mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 60 }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, fallback: string | number) => fallback),
          },
        },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });
});
