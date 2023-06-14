import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { FixturesService } from './fixtures.service';
import { SeedCommand } from './seed.command';
import { AccountsModule } from '../accounts/accounts.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [UsersModule, AccountsModule, TransactionsModule],
  providers: [FixturesService, SeedCommand],
})
export class FixturesModule {}
