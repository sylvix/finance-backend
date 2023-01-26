import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTokensService } from './userTokens.service';
import { UserToken } from './userToken.entity';
import { UsersController } from './users.controller';
import { UniqueUserEmailConstraint } from './validators/uniqueUserEmail.validator';
import { ConfigModule } from '@nestjs/config';
import { RegisterSecretConstraint } from './validators/registerSecret.validator';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserToken]), ConfigModule],
  providers: [UsersService, UserTokensService, UniqueUserEmailConstraint, RegisterSecretConstraint],
  exports: [UsersService, UserTokensService],
  controllers: [UsersController],
})
export class UsersModule {}
