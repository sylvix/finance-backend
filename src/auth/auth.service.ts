import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { DeviceDetectorService } from './deviceDetector.service';
import { User } from '../users/user.entity';
import { CookieParts, JwtRefreshTokenPayload, JwtTokenPayload } from './types';
import { UserTokensService } from '../users/userTokens.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly userTokensService: UserTokensService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly deviceDetectorService: DeviceDetectorService,
  ) {}

  async register(registerDto: RegisterDto) {
    return this.usersService.create(registerDto.email, registerDto.password, registerDto.displayName);
  }

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    const isValid = user && (await user.validatePassword(pass));

    if (isValid) {
      return user;
    }

    return null;
  }

  async getCookieWithAccessToken(userId: number) {
    const payload: JwtTokenPayload = { userId };
    const expirationTime = this.configService.get('ACCESS_TOKEN_EXPIRATION_TIME');
    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      expiresIn: `${expirationTime}s`,
    });

    return this.getCookie({ name: 'AccessToken', value: token, maxAge: expirationTime, path: '/' });
  }

  async getCookieWithRefreshToken(userId: number, userAgent: string) {
    const clientInfo = this.deviceDetectorService.parse(userAgent);
    const expirationTime = this.configService.get('REFRESH_TOKEN_EXPIRATION_TIME');
    const expiresAt = new Date(new Date().getTime() + expirationTime * 1000);

    const userToken = await this.userTokensService.create({
      user: { id: userId },
      expiresAt,
      ...clientInfo,
    });

    const payload: JwtRefreshTokenPayload = {
      userId,
      tokenId: userToken.id,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      expiresIn: `${expirationTime}s`,
    });

    return this.getCookie({ name: 'RefreshToken', value: token, maxAge: expirationTime, path: '/auth' });
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    try {
      const { tokenId }: JwtRefreshTokenPayload = await this.jwtService.verifyAsync(refreshToken as string, {
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      });

      await this.userTokensService.removeById(tokenId);
    } catch (e) {}
  }

  getCookiesForLogout() {
    return [
      this.getCookie({ name: 'AccessToken', value: '', maxAge: 0, path: '/' }),
      this.getCookie({ name: 'RefreshToken', value: '', maxAge: 0, path: '/auth' }),
    ];
  }

  private getCookie(parts: CookieParts) {
    const isDev = process.env.NODE_ENV !== 'production';

    const cookieParts = [
      `${parts.name}=${parts.value}`,
      'HttpOnly',
      `Path=${parts.path}`,
      `SameSite=${isDev ? 'None' : 'Strict'}`,
      'Secure',
      `Max-Age=${parts.maxAge}`,
    ];

    return cookieParts.join('; ');
  }
}
