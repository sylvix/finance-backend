import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { UserTokensService } from '../users/userTokens.service';
import { DeviceDetectorService } from './deviceDetector.service';
import { UserToken } from '../users/userToken.entity';
import { ClientInfo } from './types';
import { parseRefreshToken } from './helpers';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'refresh-token') {
  constructor(
    private readonly userTokensService: UserTokensService,
    private readonly deviceDetectorService: DeviceDetectorService,
  ) {
    super();
  }

  async getUserFromRefreshToken(refreshToken: string, userAgent: string) {
    if (!refreshToken) return null;

    const { tokenId, rawToken } = parseRefreshToken(refreshToken);

    const userToken = await this.userTokensService.findByIdAndExpirationDate(tokenId);

    if (!userToken) return null;

    const isTokenValid = await bcrypt.compare(rawToken, userToken.hashedToken);

    if (!isTokenValid) return null;

    const clientInfo = this.deviceDetectorService.parse(userAgent);

    if (!this.sameClient(userToken, clientInfo)) {
      await this.userTokensService.removeById(tokenId);
      return null;
    }

    return userToken.user;
  }

  async validate(request: Request): Promise<User | null> {
    try {
      const refreshToken = request.cookies['RefreshToken'] as string;
      const userAgent = request.headers['user-agent'] as string;
      return this.getUserFromRefreshToken(refreshToken, userAgent);
    } catch {
      return null;
    }
  }

  sameClient(userToken: UserToken, clientInfo: ClientInfo) {
    const keys: (keyof ClientInfo)[] = ['clientName', 'osName', 'deviceType', 'deviceBrand', 'deviceModel'];

    return keys.every((key) => userToken[key] === clientInfo[key]);
  }
}
