import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ReceiptParserModule } from './receiptParser/receiptParser.module';
import { FixturesModule } from './fixtures/fixtures.module';
import { CurrenciesModule } from './currencies/currencies.module';

@Module({
  imports: [DatabaseModule, ReceiptParserModule, FixturesModule, CurrenciesModule],
})
export class CliModule {}
