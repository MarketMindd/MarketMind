import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRecommendationHistoryCreatedAtIndex1781400000000 implements MigrationInterface {
  name = 'AddRecommendationHistoryCreatedAtIndex1781400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_recommendation_history_risk_created"
      ON "recommendation_history" ("riskTolerance", "createdAt" DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_recommendation_history_created"
      ON "recommendation_history" ("createdAt" DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_recommendation_history_created"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_recommendation_history_risk_created"');
  }
}
