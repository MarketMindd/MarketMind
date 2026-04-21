import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMarketTables1776729600000 implements MigrationInterface {
  name = 'AddMarketTables1776729600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_profiles_riskTolerance_enum" AS ENUM('Low', 'Medium', 'High')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" ADD "riskTolerance" "public"."user_profiles_riskTolerance_enum" NOT NULL DEFAULT 'Medium'`,
    );

    await queryRunner.query(`
      CREATE TABLE "stocks" (
        "symbol" character varying(20) NOT NULL,
        "name" character varying(255) NOT NULL,
        "sector" character varying(100) NOT NULL,
        CONSTRAINT "PK_stocks_symbol" PRIMARY KEY ("symbol")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "portfolios" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "stockSymbol" character varying(20) NOT NULL,
        "shares" numeric(15,4) NOT NULL DEFAULT '0',
        "avgPrice" numeric(15,4) NOT NULL DEFAULT '0',
        CONSTRAINT "PK_portfolios_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_portfolios_userId" FOREIGN KEY ("userId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_portfolios_stockSymbol" FOREIGN KEY ("stockSymbol") REFERENCES "stocks"("symbol") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_portfolios_userId" ON "portfolios" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_portfolios_stockSymbol" ON "portfolios" ("stockSymbol") `,
    );

    await queryRunner.query(`
      CREATE TABLE "market_data" (
        "time" TIMESTAMP WITH TIME ZONE NOT NULL,
        "stockSymbol" character varying(20) NOT NULL,
        "price" numeric(15,4) NOT NULL,
        "volume" bigint NOT NULL,
        CONSTRAINT "PK_market_data" PRIMARY KEY ("time", "stockSymbol"),
        CONSTRAINT "FK_market_data_stockSymbol" FOREIGN KEY ("stockSymbol") REFERENCES "stocks"("symbol") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_market_data_stockSymbol_time" ON "market_data" ("stockSymbol", "time") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_market_data_stockSymbol_time"`);
    await queryRunner.query(`DROP TABLE "market_data"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_portfolios_stockSymbol"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_portfolios_userId"`);
    await queryRunner.query(`DROP TABLE "portfolios"`);
    await queryRunner.query(`DROP TABLE "stocks"`);
    await queryRunner.query(`ALTER TABLE "user_profiles" DROP COLUMN "riskTolerance"`);
    await queryRunner.query(`DROP TYPE "public"."user_profiles_riskTolerance_enum"`);
  }
}
