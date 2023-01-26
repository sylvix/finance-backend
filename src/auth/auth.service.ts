import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { UsersService } from '../users/users.service';
import { DeviceDetectorService } from './deviceDetector.service';
import { User } from '../users/user.entity';
import { JwtTokenPayload } from './types';
import * as bcrypt from 'bcrypt';
import { SALT_ROUNDS } from '../constants';
import { UserTokensService } from '../users/userTokens.service';
import { parseRefreshToken } from './helpers';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly userTokensService: UserTokensService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly deviceDetectorService: DeviceDetectorService,
  ) {}

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findOne(email);
    const isValid = user && (await user.validatePassword(pass));

    if (isValid) {
      return user;
    }

    return null;
  }

  getCookieWithJwtAccessToken(user: User) {
    const payload: JwtTokenPayload = { userId: user.id };
    const expirationTime = this.configService.get('ACCESS_TOKEN_EXPIRATION_TIME');
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      expiresIn: `${expirationTime}s`,
    });

    return `AccessToken=${token}; HttpOnly; Path=/; Max-Age=${expirationTime}`;
  }

  async getCookieWithRefreshToken(user: User, userAgent: string) {
    const clientInfo = this.deviceDetectorService.parse(userAgent);
    const rawToken = randomUUID();
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedToken = await bcrypt.hash(rawToken, salt);
    const expirationTime = this.configService.get('REFRESH_TOKEN_EXPIRATION_TIME');
    const expiresAt = new Date(new Date().getTime() + expirationTime * 1000);

    const userToken = await this.userTokensService.create({
      user,
      hashedToken,
      expiresAt,
      ...clientInfo,
    });

    return `RefreshToken=${userToken.id}::${rawToken}; HttpOnly; Path=/; Max-Age=${expirationTime}`;
  }

  async logout(user: User, refreshToken: string | undefined): Promise<void> {
    try {
      const { tokenId } = parseRefreshToken(refreshToken as string);
      await this.userTokensService.removeById(tokenId);
    } catch (e) {}
  }

  getCookiesForLogout() {
    return ['AccessToken=; HttpOnly; Path=/; Max-Age=0', 'RefreshToken=; HttpOnly; Path=/; Max-Age=0'];
  }
}
