import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ParseCommand } from './parse.command';
import { SalykParser } from './salykParser.service';

@Module({
  imports: [HttpModule],
  providers: [ParseCommand, SalykParser],
})
export class ReceiptParserModule {}
