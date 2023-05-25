import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DownloadCurrenciesCommand } from './downloadCurrencies.command';
import { CurrenciesController } from './currencies.controller';
import { CurrenciesService } from './currencies.service';
import { CurrencyConstraint } from './validators/isCurrencyCode.validator';

@Module({
  imports: [HttpModule],
  providers: [DownloadCurrenciesCommand, CurrenciesService, CurrencyConstraint],
  controllers: [CurrenciesController],
})
export class CurrenciesModule {}
