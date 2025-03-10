import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { parsePdf } from './lib/parsePdf';

const startOfItemRegex = /^\d+\. /i;
const itemPartsRegex =
  /(?<position>\d+)\. (?<name>[^|]+)(?=\s).*?(?<count>\d+\.\d+)\s\*\s(?<pricePerUnit>\d+.\d+).*?(?<total>\d+\.\d+)/i;
const totalRegex = /^Всего: (?<total>\d+\.\d+)/i;
const dateRegex = /(\d{4}-\d{2}-\d{2})/i;
const timeRegex = /(\d{1,2}:\d{2}:\d{2})/i;
const paymentMethodRegex = /Способ оплаты : (?<paymentMethod>.*)/i;

export interface ResultsData {
  name: string;
  count: number;
  pricePerUnit: number;
  total: number;
  position: number;
}

export interface FinalResults {
  shop: string;
  date: string;
  time: string;
  total: number;
  items: ResultsData[];
  paymentMethod: string;
  rawResults: string[];
}

@Injectable()
export class SalykParser {
  constructor(private readonly httpService: HttpService) {}

  makeRequest(url: string): Observable<AxiosResponse<Buffer>> {
    return this.httpService.get(url, { responseType: 'arraybuffer' });
  }

  parsedResults: string[] = [];
  total = 0;
  tempResultString = '';
  currentStringToConcat = false;

  finalResults: FinalResults = {
    shop: '',
    date: '',
    time: '',
    total: 0,
    items: [],
    paymentMethod: '',
    rawResults: [],
  };

  addResult(acc: FinalResults) {
    const results = itemPartsRegex.exec(this.tempResultString);

    if (results) {
      acc.items.push({
        name: <string>results.groups?.name,
        count: parseFloat(results.groups?.count || '0'),
        pricePerUnit: parseFloat(results.groups?.pricePerUnit || '0'),
        total: parseFloat(results.groups?.total || '0'),
        position: parseFloat(results.groups?.position || '0'),
      });
    }

    this.parsedResults.push(this.tempResultString);
    this.tempResultString = '';
  }

  parseLineByLine = (acc: FinalResults, currentString: string) => {
    acc.rawResults.push(currentString);

    if (!acc.shop) {
      acc.shop = currentString;
    }

    if (!acc.date) {
      const dateResult = dateRegex.exec(currentString);
      if (dateResult) {
        acc.date = dateResult[0];
      }
    }

    if (!acc.time) {
      const timeResult = timeRegex.exec(currentString);
      if (timeResult) {
        acc.time = timeResult[0];
      }
    }

    if (!acc.paymentMethod) {
      const paymentMethodResult = paymentMethodRegex.exec(currentString);
      if (paymentMethodResult && paymentMethodResult.groups && paymentMethodResult.groups.paymentMethod) {
        acc.paymentMethod = paymentMethodResult.groups.paymentMethod;
      }
    }

    if (startOfItemRegex.test(currentString)) {
      if (this.tempResultString.length > 0) {
        this.addResult(acc);
      }

      this.currentStringToConcat = true;
    }

    const totalResults = totalRegex.exec(currentString);
    if (totalResults) {
      this.addResult(acc);
      this.currentStringToConcat = false;
      if (totalResults.groups && totalResults.groups.total) {
        acc.total = parseFloat(totalResults.groups.total);
      }
    }

    if (this.currentStringToConcat) {
      this.tempResultString += currentString + ' ';
    }

    return acc;
  };

  async parse(url: string) {
    const response = await lastValueFrom(this.makeRequest(url));
    const parsedText = await parsePdf(response.data);
    return parsedText.reduce(this.parseLineByLine, this.finalResults);
  }
}
