import { MigrationInterface } from 'typeorm';
import { UserAndTokens1674650624399 } from './migrations/1674650624399-UserAndTokens';

interface MigrationClass {
  new (): MigrationInterface;
}

const migrations: MigrationClass[] = [UserAndTokens1674650624399];

export default migrations;
