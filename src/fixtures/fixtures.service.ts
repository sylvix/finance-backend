import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { DataSource } from 'typeorm';
import { AccountsService } from '../accounts/accounts.service';
import { MutateAccountDto } from '../accounts/dto/MutateAccount.dto';
import { MutateTransactionDto } from '../transactions/dto/MutateTransaction.dto';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class FixturesService {
  constructor(
    private readonly usersService: UsersService,
    private readonly accountsService: AccountsService,
    private readonly transactionsService: TransactionsService,
    private readonly dataSource: DataSource,
  ) {}

  async cleanDatabase(): Promise<void> {
    try {
      const entities = this.dataSource.entityMetadatas;
      const tableNames = entities.map((entity) => `"${entity.tableName}"`).join(', ');

      await this.dataSource.query(`TRUNCATE ${tableNames} RESTART IDENTITY CASCADE;`);
      console.log('[DATABASE]: Clean');
    } catch (error) {
      throw new Error(`ERROR: Cleaning database: ${error}`);
    }
  }

  async createUsers() {
    return this.usersService.create('test@test.com', '1qaz@WSXTest', 'Test User');
  }

  async createAccount(groupId: number, mutateAccountDto: MutateAccountDto) {
    return this.accountsService.create(groupId, mutateAccountDto);
  }

  async createTransactions(groupId: number, transactionDTOs: MutateTransactionDto[]) {
    const transactions = [];

    for (const dto of transactionDTOs) {
      const transaction = await this.transactionsService.create(groupId, dto);
      transactions.push(transaction);
    }

    return transactions;
  }
}
