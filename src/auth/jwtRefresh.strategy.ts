import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JwtRefreshTokenPayload } from './types';
import { UserTokensService } from '../users/userTokens.service';
import { DeviceDetectorService } from './deviceDetector.service';
import { sameClient } from './helpers';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwtRefresh') {
  constructor(
    configService: ConfigService,
    private readonly userTokensService: UserTokensService,
    private readonly deviceDetectorService: DeviceDetectorService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('REFRESH_TOKEN_SECRET') || '',
      passReqToCallback: true,
    });
  }

  async verify(tokenId: number, userAgent: string) {
    const userToken = await this.userTokensService.findByIdAndExpirationDate(tokenId);

    if (!userToken) {
      throw new Error('This token does not exist in the database');
    }

    const clientInfo = this.deviceDetectorService.parse(userAgent);

    if (!sameClient(userToken, clientInfo)) {
      await this.userTokensService.removeById(tokenId);
      throw new Error('Device info mismatch');
    }
  }

  async validate(request: Request, payload: JwtRefreshTokenPayload) {
    try {
      const { tokenId } = payload;
      const userAgent = request.headers['user-agent'] as string;
      await this.verify(tokenId, userAgent);
    } catch {
      return null;
    }

    return payload;
  }
}
