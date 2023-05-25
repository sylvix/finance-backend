import { MigrationInterface } from 'typeorm';
import { Initial1681390433196 } from './migrations/1681390433196-Initial';
import { Accounts1683222656763 } from './migrations/1683222656763-Accounts';

interface MigrationClass {
  new (): MigrationInterface;
}

const migrations: MigrationClass[] = [Initial1681390433196, Accounts1683222656763];

export default migrations;
