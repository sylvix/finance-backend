import { Command, CommandRunner } from 'nest-commander';
import { FixturesService } from './fixtures.service';
import { AccountType } from '../accounts/account.entity';

@Command({ name: 'seed', description: 'Load Fixtures' })
export class SeedCommand extends CommandRunner {
  constructor(private readonly fixturesService: FixturesService) {
    super();
  }

  async run(): Promise<void> {
    console.log('======= Truncating database! ==');
    await this.fixturesService.cleanDatabase();
    console.log('======= Creating users! =======');
    const user = await this.fixturesService.createUsers();
    console.log('======= Creating accounts! ====');
    const account = await this.fixturesService.createAccount(user.defaultGroupId, {
      name: 'KGS Wallet',
      type: AccountType.CASH,
      currency: 'KGS',
    });
    console.log('======= Creating transactions! ===');
    await this.fixturesService.createTransactions(user.defaultGroupId, [
      {
        conductedAt: new Date('2023-06-11T10:00:00.000Z'),
        incomingAccountId: account.id,
        incomingAmount: 1000000,
        description: 'Initial',
      },
      {
        conductedAt: new Date('2023-06-11T11:00:00.000Z'),
        outgoingAccountId: account.id,
        outgoingAmount: 10000,
        description: 'Bread',
      },
      {
        conductedAt: new Date('2023-06-11T11:05:00.000Z'),
        outgoingAccountId: account.id,
        outgoingAmount: 5000,
        description: 'Water',
      },
    ]);
    console.log('======= Done! =================');
  }
}
