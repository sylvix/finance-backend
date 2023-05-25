import * as path from 'path';
import { promises as fs } from 'fs';
import { Command, CommandRunner } from 'nest-commander';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ISO_CURRENCIES_URL, OER_CURRENCIES_URL } from './constants';
import { IsoCurrencies, IsoCurrenciesXMLResponse, OERCurrenciesResponse } from './types';
import { CurrenciesService } from './currencies.service';
import { XMLParser } from 'fast-xml-parser';

@Command({ name: 'downloadCurrencies', description: 'Download, parse and update currencies file' })
export class DownloadCurrenciesCommand extends CommandRunner {
  constructor(private readonly httpService: HttpService, private readonly currenciesService: CurrenciesService) {
    super();
  }

  async run() {
    const currencies = await this.getOERCurrencies();

    const isoCurrencies = await this.getISOCurrencies();

    const result: IsoCurrencies = {};

    Object.keys(currencies).forEach((code) => {
      if (code in isoCurrencies) {
        result[code] = {
          name: currencies[code],
          decimals: isoCurrencies[code].decimals,
        };
      } else {
        console.log('Currency', code, 'not found in ISO currencies! Skipping it...');
      }
    });

    console.log('OER number:', Object.keys(currencies).length, 'Result number:', Object.keys(result).length);

    await this.writeToFile(result);

    console.log('=== CURRENCIES SUCCESSFULLY DOWNLOADED ===');
  }

  private async getOERCurrencies() {
    const response = await lastValueFrom(this.httpService.get(OER_CURRENCIES_URL));
    return response.data as OERCurrenciesResponse;
  }

  private async getISOCurrencies() {
    const response = await lastValueFrom(this.httpService.get(ISO_CURRENCIES_URL));
    const parser = new XMLParser();
    const parsed = parser.parse(response.data) as IsoCurrenciesXMLResponse;
    const currencies: IsoCurrencies = {};

    parsed.ISO_4217.CcyTbl.CcyNtry.forEach((entry) => {
      currencies[entry.Ccy] = {
        name: entry.CcyNm,
        decimals: parseInt(entry.CcyMnrUnts) || 0,
      };
    });

    return currencies;
  }

  private async writeToFile(data: unknown) {
    const filePath = this.currenciesService.getFilePath();
    const dirname = path.dirname(filePath);

    if (!(await fs.stat(dirname))) {
      await fs.mkdir(dirname, { recursive: true });
    }

    await fs.writeFile(filePath, JSON.stringify(data));
  }
}
