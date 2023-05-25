import { MigrationInterface, QueryRunner } from 'typeorm';

export class Accounts1683222656763 implements MigrationInterface {
  name = 'Accounts1683222656763';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."account_type_enum" AS ENUM('cash', 'bank', 'other')`);
    await queryRunner.query(
      `CREATE TABLE "account" ("id" SERIAL NOT NULL, "groupId" integer NOT NULL, "name" character varying NOT NULL, "currency" character varying(4) NOT NULL, "type" "public"."account_type_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "account" ADD CONSTRAINT "FK_905da485e4efd0daff62731f020" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "account" DROP CONSTRAINT "FK_905da485e4efd0daff62731f020"`);
    await queryRunner.query(`DROP TABLE "account"`);
    await queryRunner.query(`DROP TYPE "public"."account_type_enum"`);
  }
}
