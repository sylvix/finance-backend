import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ParseCommand } from './parse.command';

@Module({
  imports: [HttpModule],
  providers: [ParseCommand],
})
export class ReceiptParserModule {}
