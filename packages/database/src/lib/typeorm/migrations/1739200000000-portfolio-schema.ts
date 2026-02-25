import { MigrationInterface, QueryRunner } from 'typeorm';

export class PortfolioSchema1739200000000 implements MigrationInterface {
  name = 'PortfolioSchema1739200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "portfolios" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" character varying(255) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_portfolios_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "portfolio_holdings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "portfolioId" uuid NOT NULL,
        "symbol" character varying(12) NOT NULL,
        "companyName" character varying(255) NOT NULL,
        "shares" numeric(18, 6) NOT NULL,
        "avgCost" numeric(18, 6) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_portfolio_holdings_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_portfolio_holdings_portfolioId" FOREIGN KEY ("portfolioId") REFERENCES "portfolios"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_portfolio_holdings_portfolioId_symbol"
      ON "portfolio_holdings" ("portfolioId", "symbol")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS "UQ_portfolio_holdings_portfolioId_symbol"',
    );
    await queryRunner.query('DROP TABLE IF EXISTS "portfolio_holdings"');
    await queryRunner.query('DROP TABLE IF EXISTS "portfolios"');
  }
}
