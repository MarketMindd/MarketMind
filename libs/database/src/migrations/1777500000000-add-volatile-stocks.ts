import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVolatileStocks1777500000000 implements MigrationInterface {
  name = 'AddVolatileStocks1777500000000';

  private readonly volatileStocks = [
    { symbol: 'ASTS', name: 'AST SpaceMobile, Inc.', sector: 'Communication Services' },
    { symbol: 'PLTR', name: 'Palantir Technologies Inc.', sector: 'Technology' },
    { symbol: 'SOFI', name: 'SoFi Technologies, Inc.', sector: 'Financial Services' },
    { symbol: 'NIO', name: 'NIO Inc.', sector: 'Consumer Cyclical' },
    { symbol: 'MRNA', name: 'Moderna, Inc.', sector: 'Healthcare' },
    { symbol: 'GME', name: 'GameStop Corp.', sector: 'Consumer Cyclical' },
    { symbol: 'AMC', name: 'AMC Entertainment Holdings, Inc.', sector: 'Communication Services' },
    { symbol: 'RIVN', name: 'Rivian Automotive, Inc.', sector: 'Consumer Cyclical' },
    { symbol: 'COIN', name: 'Coinbase Global, Inc.', sector: 'Financial Services' },
    { symbol: 'HOOD', name: 'Robinhood Markets, Inc.', sector: 'Financial Services' },
    { symbol: 'INTC', name: 'Intel Corporation', sector: 'Technology' },
    { symbol: 'RKLB', name: 'Rocket Lab USA, Inc.', sector: 'Industrials' },
    { symbol: 'ACHR', name: 'Archer Aviation Inc.', sector: 'Industrials' },
    { symbol: 'JOBY', name: 'Joby Aviation, Inc.', sector: 'Industrials' },
    { symbol: 'PL', name: 'Planet Labs PBC', sector: 'Technology' },
    { symbol: 'AUR', name: 'Aurora Innovation, Inc.', sector: 'Technology' },
    { symbol: 'IREN', name: 'Iris Energy Limited', sector: 'Technology' },
    { symbol: 'OKLO', name: 'Oklo Inc.', sector: 'Utilities' },
    { symbol: 'QS', name: 'QuantumScape Corporation', sector: 'Consumer Cyclical' },
    { symbol: 'DELL', name: 'Dell Technologies Inc.', sector: 'Technology' },
    { symbol: 'NET', name: 'Cloudflare, Inc.', sector: 'Technology' },
    { symbol: 'CLOV', name: 'Clover Health Investments, Corp.', sector: 'Healthcare' },
    { symbol: 'VST', name: 'Vistra Corp.', sector: 'Utilities' },
    { symbol: 'SPCX', name: 'Space Exploration Technologies Corp.', sector: 'Technology' },
    { symbol: 'WIX', name: 'Wix.com Ltd.', sector: 'Technology' },
    { symbol: 'TEVA', name: 'Teva Pharmaceutical Industries Ltd.', sector: 'Healthcare' },
    { symbol: 'ESLT', name: 'Elbit Systems Ltd.', sector: 'Industrials' },
    { symbol: 'MNDY', name: 'monday.com Ltd.', sector: 'Technology' },
    { symbol: 'S', name: 'SentinelOne, Inc.', sector: 'Technology' },
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const stock of this.volatileStocks) {
      await queryRunner.query(
        'INSERT INTO "stocks" ("symbol", "name", "sector") VALUES ($1, $2, $3) ON CONFLICT ("symbol") DO NOTHING',
        [stock.symbol, stock.name, stock.sector],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const symbols = this.volatileStocks.map((s) => s.symbol);
    const placeholders = symbols.map((_, i) => `$${i + 1}`).join(', ');
    await queryRunner.query(`DELETE FROM "stocks" WHERE "symbol" IN (${placeholders})`, symbols);
  }
}
