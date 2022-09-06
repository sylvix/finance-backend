import { Command, CommandRunner } from 'nest-commander';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { map, mergeAll, Observable } from 'rxjs';
import { parsePdf } from './pdf2json';
import { promises as fs } from 'fs';

const startOfItemRegex = /^\d+\. /i;
const itemPartsRegex = /(?<position>\d+)\. (?<name>[^|]+)(?=\s).*?(?<count>\d+\.\d+)\s\*\s(?<pricePerUnit>\d+.\d+).*?(?<total>\d+\.\d+)/i;
const totalRegex = /^Всего: (?<total>\d+\.\d+)/i;
const dateRegex = /(\d{4}-\d{2}-\d{2})/i;
const timeRegex = /(\d{1,2}:\d{2}:\d{2})/i;
const paymentMethodRegex = /Способ оплаты : (?<paymentMethod>.*)/i;

interface ResultsData {
  name: string;
  count: number;
  pricePerUnit: number;
  total: number;
  position: number;
}

@Command({ name: 'parse', description: 'Parse' })
export class ParseCommand extends CommandRunner {
  constructor(private readonly httpService: HttpService) {
    super();
  }
  makeRequest(url: string): Observable<AxiosResponse> {
    return this.httpService.get(url, { responseType: 'arraybuffer' });
  }

  rawResults: string[] = [];
  parsedResults: string[] = [];
  total = 0;
  date: null | string = null;
  time: null | string = null;
  paymentMethod: null | string = null;
  tempResultString = '';
  currentStringToConcat = false;

  resultsDataArray: ResultsData[] = [];

  addResult() {
    const results = itemPartsRegex.exec(this.tempResultString);

    results &&
      this.resultsDataArray.push({
        name: <string>results.groups?.name,
        count: parseFloat(results.groups?.count || '0'),
        pricePerUnit: parseFloat(results.groups?.pricePerUnit || '0'),
        total: parseFloat(results.groups?.total || '0'),
        position: parseFloat(results.groups?.position || '0'),
      });

    this.parsedResults.push(this.tempResultString);
    this.tempResultString = '';
  }

  parseLineByLine = (currentString: string) => {
    this.rawResults.push(currentString);

    if (!this.date) {
      const dateResult = dateRegex.exec(currentString);
      if (dateResult) {
        this.date = dateResult[0];
      }
    }

    if (!this.time) {
      const timeResult = timeRegex.exec(currentString);
      if (timeResult) {
        this.time = timeResult[0];
      }
    }

    if (!this.paymentMethod) {
      const paymentMethodResult = paymentMethodRegex.exec(currentString);
      if (paymentMethodResult && paymentMethodResult.groups && paymentMethodResult.groups.paymentMethod) {
        this.paymentMethod = paymentMethodResult.groups.paymentMethod;
      }
    }

    if (startOfItemRegex.test(currentString)) {
      if (this.tempResultString.length > 0) {
        this.addResult();
      }

      this.currentStringToConcat = true;
    }

    const totalResults = totalRegex.exec(currentString);
    if (totalResults) {
      this.addResult();
      this.currentStringToConcat = false;
      if (totalResults.groups && totalResults.groups.total) {
        this.total = parseFloat(totalResults.groups.total);
      }
    }

    if (this.currentStringToConcat) {
      this.tempResultString += currentString + ' ';
    }
  };

  async run(passedParam: string[]): Promise<void> {
    this.makeRequest(passedParam[0])
      .pipe(
        map((response) => parsePdf(<Buffer>response.data)),
        mergeAll(),
      )
      .subscribe({
        next: this.parseLineByLine,
        complete: async () => {
          const finalResults = {
            shop: this.rawResults[0],
            date: this.date,
            time: this.time,
            total: this.total,
            items: this.resultsDataArray,
            paymentMethod: this.paymentMethod,
          };

          await fs.mkdir('./tmp', { recursive: true });
          await fs.writeFile('./tmp/rawResults.txt', this.rawResults.join('\n'));
          await fs.writeFile('./tmp/parsedResults.txt', this.parsedResults.join('\n'));
          await fs.writeFile('./tmp/finalResults.json', JSON.stringify(finalResults, null, 2));
        },
      });
  }
}
