import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1681390433196 implements MigrationInterface {
  name = 'Initial1681390433196';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_token" ("id" SERIAL NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "clientName" character varying NOT NULL, "osName" character varying NOT NULL, "deviceType" character varying NOT NULL, "deviceBrand" character varying NOT NULL, "deviceModel" character varying NOT NULL, "userId" integer, CONSTRAINT "PK_48cb6b5c20faa63157b3c1baf7f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "group" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_256aa0fda9b1de1a73ee0b7106b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE TYPE "public"."user_to_group_role_enum" AS ENUM('owner', 'member')`);
    await queryRunner.query(
      `CREATE TABLE "user_to_group" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "groupId" integer NOT NULL, "role" "public"."user_to_group_role_enum" NOT NULL DEFAULT 'member', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e255a2f811f2e84e420510370c2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "displayName" character varying NOT NULL, "avatar" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "defaultGroupId" integer NOT NULL, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_token" ADD CONSTRAINT "FK_d37db50eecdf9b8ce4eedd2f918" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_to_group" ADD CONSTRAINT "FK_d5befb2defb9ce0fd62d37fdb52" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_to_group" ADD CONSTRAINT "FK_177692922d880c756b86056e910" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_f3b78b763413cceb9953e38672d" FOREIGN KEY ("defaultGroupId") REFERENCES "group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_f3b78b763413cceb9953e38672d"`);
    await queryRunner.query(`ALTER TABLE "user_to_group" DROP CONSTRAINT "FK_177692922d880c756b86056e910"`);
    await queryRunner.query(`ALTER TABLE "user_to_group" DROP CONSTRAINT "FK_d5befb2defb9ce0fd62d37fdb52"`);
    await queryRunner.query(`ALTER TABLE "user_token" DROP CONSTRAINT "FK_d37db50eecdf9b8ce4eedd2f918"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "user_to_group"`);
    await queryRunner.query(`DROP TYPE "public"."user_to_group_role_enum"`);
    await queryRunner.query(`DROP TABLE "group"`);
    await queryRunner.query(`DROP TABLE "user_token"`);
  }
}
