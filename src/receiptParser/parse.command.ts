import { Command, CommandRunner } from 'nest-commander';
import { promises as fs } from 'fs';
import { SalykParser } from './salykParser.service';

@Command({ name: 'parse', description: 'Parse' })
export class ParseCommand extends CommandRunner {
  constructor(private readonly salykParser: SalykParser) {
    super();
  }

  async run(passedParam: string[]): Promise<void> {
    const url = passedParam[0];
    await this.salykParser.parse(url);
    this.salykParser.parse(url).subscribe(async (finalResults) => {
      await fs.mkdir('./tmp', { recursive: true });
      await fs.writeFile('./tmp/finalResults.json', JSON.stringify(finalResults, null, 2));
    });
  }
}
