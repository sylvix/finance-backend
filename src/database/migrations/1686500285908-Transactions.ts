import { MigrationInterface, QueryRunner } from 'typeorm';

export class Transactions1686500285908 implements MigrationInterface {
  name = 'Transactions1686500285908';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "transaction" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "conductedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "groupId" integer NOT NULL, "incomingAccountId" integer, "outgoingAccountId" integer, "incomingAmount" bigint, "outgoingAmount" bigint, "description" character varying NOT NULL, CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD CONSTRAINT "FK_05749c68cee9f1fbc8e33040970" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD CONSTRAINT "FK_8712e278c09cebfaafb224c84cc" FOREIGN KEY ("incomingAccountId") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD CONSTRAINT "FK_6c3ed8136fbc42b3b3a6091bd2c" FOREIGN KEY ("outgoingAccountId") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_6c3ed8136fbc42b3b3a6091bd2c"`);
    await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_8712e278c09cebfaafb224c84cc"`);
    await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_05749c68cee9f1fbc8e33040970"`);
    await queryRunner.query(`DROP TABLE "transaction"`);
  }
}
