import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSymbolFilterState1777100000000 implements MigrationInterface {
  name = 'AddSymbolFilterState1777100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "symbol_filter_state" (
        "stockSymbol"               varchar(20)    NOT NULL,
        "lastForwardedPriceChange"  numeric(8,4)   NOT NULL DEFAULT 0,
        "updatedAt"                 timestamptz    NOT NULL DEFAULT now(),
        CONSTRAINT "PK_symbol_filter_state" PRIMARY KEY ("stockSymbol")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "symbol_filter_state"`);
  }
}
