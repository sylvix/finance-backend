import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './account.entity';
import { AuthModule } from '../auth/auth.module';
import { AccountInGroupGuard } from './guards/AccountInGroup.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Account]), AuthModule],
  providers: [AccountsService, AccountInGroupGuard],
  exports: [AccountsService],
  controllers: [AccountsController],
})
export class AccountsModule {}
