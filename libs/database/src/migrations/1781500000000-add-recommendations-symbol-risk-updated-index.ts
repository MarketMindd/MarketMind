import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRecommendationsSymbolRiskUpdatedIndex1781500000000 implements MigrationInterface {
  name = 'AddRecommendationsSymbolRiskUpdatedIndex1781500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_recommendations_symbol_risk_updated"
      ON "recommendations" ("stockSymbol", "riskTolerance", "updatedAt" DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_recommendations_symbol_risk_updated"');
  }
}
