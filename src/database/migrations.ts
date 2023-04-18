import { MigrationInterface } from 'typeorm';
import { Initial1681390433196 } from './migrations/1681390433196-Initial';

interface MigrationClass {
  new (): MigrationInterface;
}

const migrations: MigrationClass[] = [Initial1681390433196];

export default migrations;
