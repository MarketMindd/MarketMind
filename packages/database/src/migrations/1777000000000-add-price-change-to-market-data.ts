import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPriceChangeToMarketData1777000000000 implements MigrationInterface {
  name = 'AddPriceChangeToMarketData1777000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "market_data" ADD COLUMN IF NOT EXISTS "priceChange" numeric(8,4) NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "market_data" DROP COLUMN IF EXISTS "priceChange"`);
  }
}
