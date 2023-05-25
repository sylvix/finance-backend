import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import { DeviceDetectorService } from './deviceDetector.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtRefreshStrategy } from './jwtRefresh.strategy';
import { UserGuard } from './user.guard';
import { GroupsModule } from '../groups/groups.module';
import { UserGroupGuard } from './userGroup.guard';

@Module({
  imports: [UsersModule, GroupsModule, PassportModule, ConfigModule, JwtModule],
  providers: [
    AuthService,
    LocalStrategy,
    DeviceDetectorService,
    JwtStrategy,
    JwtRefreshStrategy,
    UserGuard,
    UserGroupGuard,
  ],
  exports: [UserGroupGuard, UserGuard, GroupsModule],
  controllers: [AuthController],
})
export class AuthModule {}
