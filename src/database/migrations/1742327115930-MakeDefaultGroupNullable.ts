import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeDefaultGroupNullable1742327115930 implements MigrationInterface {
  name = 'MakeDefaultGroupNullable1742327115930';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_f3b78b763413cceb9953e38672d"`);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "defaultGroupId" DROP NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_f3b78b763413cceb9953e38672d" FOREIGN KEY ("defaultGroupId") REFERENCES "group"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_f3b78b763413cceb9953e38672d"`);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "defaultGroupId" SET NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_f3b78b763413cceb9953e38672d" FOREIGN KEY ("defaultGroupId") REFERENCES "group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
