import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { Role } from '../common/enums/role.enum';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    if (dto.role === Role.WARUNG && !dto.warungId) {
      throw new BadRequestException('warungId is required for WARUNG role');
    }

    const saltRoundsConfig = this.configService.get<string | number>('BCRYPT_SALT_ROUNDS', 10);
    const parsedSaltRounds = typeof saltRoundsConfig === 'number' ? saltRoundsConfig : Number.parseInt(saltRoundsConfig, 10);
    const saltRounds = Number.isFinite(parsedSaltRounds) && parsedSaltRounds > 0 ? parsedSaltRounds : 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    const user = await this.usersService.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
      role: dto.role,
      warung: dto.warungId ? { connect: { id: dto.warungId } } : undefined,
    });

    return this.sanitizeUser(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokenSet = await this.issueTokenPair(user.id, user.email, user.role as Role);
    return {
      ...tokenSet,
      user: this.sanitizeUser(user),
    };
  }

  async refresh(dto: RefreshTokenDto) {
    const payload = await this.verifyRefreshToken(dto.refreshToken);
    const userId = payload.sub;

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    const activeTokens = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    let matchingTokenId: string | null = null;
    for (const tokenRow of activeTokens) {
      const match = await bcrypt.compare(dto.refreshToken, tokenRow.tokenHash);
      if (match) {
        matchingTokenId = tokenRow.id;
        break;
      }
    }

    if (!matchingTokenId) {
      throw new UnauthorizedException('Refresh token not recognized');
    }

    await this.prisma.refreshToken.update({
      where: { id: matchingTokenId },
      data: { revokedAt: new Date() },
    });

    return this.issueTokenPair(user.id, user.email, user.role as Role);
  }

  async logout(userId: string, refreshToken?: string) {
    if (!refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      return { message: 'Logged out from all sessions' };
    }

    const activeTokens = await this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null },
    });

    let tokenId: string | null = null;
    for (const tokenRow of activeTokens) {
      const match = await bcrypt.compare(refreshToken, tokenRow.tokenHash);
      if (match) {
        tokenId = tokenRow.id;
        break;
      }
    }

    if (!tokenId) {
      throw new UnauthorizedException('Refresh token not found');
    }

    await this.prisma.refreshToken.update({
      where: { id: tokenId },
      data: { revokedAt: new Date() },
    });

    return { message: 'Logged out' };
  }

  async me(userId: string) {
    const user = await this.usersService.findOrThrow(userId);
    return this.sanitizeUser(user);
  }

  private async issueTokenPair(userId: string, email: string, role: Role) {
    const payload: JwtPayload = { sub: userId, email, role };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET', 'access-secret'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m') as any,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'refresh-secret'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d') as any,
    });

    const decoded = this.jwtService.decode(refreshToken) as { exp?: number };
    const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 7 * 86400000);

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'refresh-secret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private sanitizeUser(user: {
    id: string;
    email: string;
    name: string;
    role: string;
    warungId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      warungId: user.warungId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
