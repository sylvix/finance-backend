import { MigrationInterface } from 'typeorm';
import { UserAndTokens1674898061794 } from './migrations/1674898061794-UserAndTokens';

interface MigrationClass {
  new (): MigrationInterface;
}

const migrations: MigrationClass[] = [UserAndTokens1674898061794];

export default migrations;
