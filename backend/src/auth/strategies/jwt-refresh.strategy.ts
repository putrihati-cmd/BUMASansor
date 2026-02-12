import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET', 'refresh-secret'),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload) {
    const rawAuth = req.headers.authorization;
    const bearer = Array.isArray(rawAuth) ? rawAuth[0] : rawAuth;
    const token = bearer?.replace('Bearer ', '');
    return { ...payload, refreshToken: token };
  }
}
