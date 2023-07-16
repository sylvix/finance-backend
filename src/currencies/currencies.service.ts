import * as path from 'path';
import { promises as fs } from 'fs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ASSETS_DIR, CURRENCIES_FILENAME } from './constants';
import { CurrencyDto } from './dto/currency.dto';
import { IsoCurrencies } from './types';

@Injectable()
export class CurrenciesService {
  currencies: null | CurrencyDto[];

  constructor() {
    void this.readAll();
  }

  async findAll() {
    if (this.currencies === null) {
      return await this.readAll();
    }

    return this.currencies;
  }

  async findOne(code: string) {
    const currencies = await this.findAll();
    const currency = currencies.find((currency) => currency.code === code);

    if (!currency) {
      throw new NotFoundException(`Currency "${code}" does not exist`);
    }

    return currency;
  }

  getFilePath() {
    const assetsPath = path.join('./', ASSETS_DIR);
    return path.join(assetsPath, CURRENCIES_FILENAME);
  }

  private async readAll() {
    const fileContents = await fs.readFile(this.getFilePath());
    const currencies = JSON.parse(fileContents.toString()) as IsoCurrencies;
    this.currencies = Object.keys(currencies).map((code) => {
      const dto = new CurrencyDto();
      dto.code = code;
      dto.name = currencies[code].name;
      dto.decimals = currencies[code].decimals;
      return dto;
    });

    return this.currencies;
  }
}
