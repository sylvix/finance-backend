import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTokensService } from './userTokens.service';
import { UserToken } from './userToken.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserToken])],
  providers: [UsersService, UserTokensService],
  exports: [UsersService, UserTokensService],
})
export class UsersModule {}
