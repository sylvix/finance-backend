import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { DeviceDetectorService } from './deviceDetector.service';
import { User } from '../users/user.entity';
import { JwtRefreshTokenPayload, AccessTokenPayload } from './types';
import { UserTokensService } from '../users/userTokens.service';
import { RegisterDto } from './dto/register.dto';
import { UserResponseDto } from './dto/userResponse.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly userTokensService: UserTokensService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly deviceDetectorService: DeviceDetectorService,
  ) {}

  async register(registerDto: RegisterDto, userAgent: string) {
    const user = await this.usersService.create(registerDto.email, registerDto.password, registerDto.displayName);

    return this.createUserResponse(user, userAgent);
  }

  async createUserResponse(user: User, userAgent: string) {
    return new UserResponseDto(user, {
      access: await this.getAccessToken(user),
      refresh: await this.getRefreshToken(user.id, userAgent),
    });
  }

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    const isValid = user && (await user.validatePassword(pass));

    if (isValid) {
      return user;
    }

    return null;
  }

  async getAccessToken(user: User) {
    const payload: AccessTokenPayload = { userId: user.id, groupId: user.defaultGroupId };
    const expirationTime = this.configService.get<string>('ACCESS_TOKEN_EXPIRATION_TIME') || '300';

    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      expiresIn: `${expirationTime}s`,
    });
  }

  async createAccessToken(userId: number) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new Error('No user found with this id');
    }

    return this.getAccessToken(user);
  }

  async getRefreshToken(userId: number, userAgent: string) {
    const clientInfo = this.deviceDetectorService.parse(userAgent);
    const expirationTime = this.configService.get<string>('REFRESH_TOKEN_EXPIRATION_TIME') || '2592000';
    const expiresAt = new Date(new Date().getTime() + Number(expirationTime) * 1000);

    const userToken = await this.userTokensService.create({
      user: { id: userId },
      expiresAt,
      ...clientInfo,
    });

    const payload: JwtRefreshTokenPayload = {
      userId,
      tokenId: userToken.id,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      expiresIn: `${expirationTime}s`,
    });
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    try {
      if (!refreshToken) return;

      const token = refreshToken.replace(/bearer /gi, '');
      const { tokenId }: JwtRefreshTokenPayload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      });

      await this.userTokensService.removeById(tokenId);
    } catch {
      /* empty */
    }
  }
}
