import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { GroupsModule } from './groups/groups.module';
import { CurrenciesModule } from './currencies/currencies.module';
import { AccountsModule } from './accounts/accounts.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    GroupsModule,
    CurrenciesModule,
    AccountsModule,
    TransactionsModule,
  ],
  providers: [AppService],
})
export class AppModule {}
