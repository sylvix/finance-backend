import { MigrationInterface } from 'typeorm';
import { User1673348590792 } from './migrations/1673348590792-User';

interface MigrationClass {
  new (): MigrationInterface;
}

const migrations: MigrationClass[] = [User1673348590792];

export default migrations;
