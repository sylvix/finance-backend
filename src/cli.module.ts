import { Module } from '@nestjs/common';
import { ReceiptParserModule } from './receiptParser/receiptParser.module';

@Module({
  imports: [ReceiptParserModule],
})
export class CliModule {}
