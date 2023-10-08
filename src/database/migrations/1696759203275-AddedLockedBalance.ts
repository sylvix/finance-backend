import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedLockedBalance1696759203275 implements MigrationInterface {
  name = 'AddedLockedBalance1696759203275';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "account" ADD "lockedBalance" bigint`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "lockedBalance"`);
  }
}
