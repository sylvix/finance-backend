import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import { DeviceDetectorService } from './deviceDetector.service';
import { RefreshTokenStrategy } from './refreshToken.strategy';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const expTime = configService.get('ACCESS_TOKEN_EXPIRATION_TIME');

        return {
          secret: configService.get('ACCESS_TOKEN_SECRET'),
          signOptions: { expiresIn: `${expTime}s` },
        };
      },
    }),
  ],
  providers: [AuthService, LocalStrategy, DeviceDetectorService, RefreshTokenStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
