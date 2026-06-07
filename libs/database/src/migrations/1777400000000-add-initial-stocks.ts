import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInitialStocks1777400000000 implements MigrationInterface {
  name = 'AddInitialStocks1777400000000';

  private readonly initialStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Communication Services' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Cyclical' },
    { symbol: 'META', name: 'Meta Platforms', sector: 'Communication Services' },
    { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Cyclical' },
    { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
    { symbol: 'XOM', name: 'Exxon Mobil', sector: 'Energy' },
    { symbol: 'JPM', name: 'JPMorgan Chase', sector: 'Financial Services' },
    { symbol: 'V', name: 'Visa Inc.', sector: 'Financial Services' },
    { symbol: 'UNH', name: 'UnitedHealth Group', sector: 'Healthcare' },
    { symbol: 'HD', name: 'Home Depot', sector: 'Consumer Cyclical' },
    { symbol: 'PG', name: 'Procter & Gamble', sector: 'Consumer Defensive' },
    { symbol: 'DIS', name: 'Walt Disney', sector: 'Communication Services' },
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const stock of this.initialStocks) {
      await queryRunner.query(
        'INSERT INTO "stocks" ("symbol", "name", "sector") VALUES ($1, $2, $3) ON CONFLICT ("symbol") DO NOTHING',
        [stock.symbol, stock.name, stock.sector]
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const symbols = this.initialStocks.map((s) => s.symbol);
    const placeholders = symbols.map((_, i) => `$${i + 1}`).join(', ');
    await queryRunner.query(
      `DELETE FROM "stocks" WHERE "symbol" IN (${placeholders})`,
      symbols
    );
  }
}
