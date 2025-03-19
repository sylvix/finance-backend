import { MigrationInterface } from 'typeorm';
import { Initial1681390433196 } from './migrations/1681390433196-Initial';
import { Accounts1683222656763 } from './migrations/1683222656763-Accounts';
import { Transactions1686500285908 } from './migrations/1686500285908-Transactions';
import { AddedLockedBalance1696759203275 } from './migrations/1696759203275-AddedLockedBalance';
import { MakeDefaultGroupNullable1742327115930 } from './migrations/1742327115930-MakeDefaultGroupNullable';

interface MigrationClass {
  new (): MigrationInterface;
}

const migrations: MigrationClass[] = [
  Initial1681390433196,
  Accounts1683222656763,
  Transactions1686500285908,
  AddedLockedBalance1696759203275,
  MakeDefaultGroupNullable1742327115930,
];

export default migrations;
