import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPerformanceGrading1781100000000 implements MigrationInterface {
  name = 'AddPerformanceGrading1781100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TYPE \"public\".\"recommendation_outcome_enum\" AS ENUM('Success', 'Miss', 'N/A')",
    );
    await queryRunner.query(`
      ALTER TABLE "recommendation_history"
        ADD COLUMN IF NOT EXISTS "currentPrice" decimal(15,4),
        ADD COLUMN IF NOT EXISTS "returnPct"    decimal(8,4),
        ADD COLUMN IF NOT EXISTS "outcome"      "public"."recommendation_outcome_enum",
        ADD COLUMN IF NOT EXISTS "isFrozen"     boolean NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "recommendation_history" DROP COLUMN IF EXISTS "isFrozen"',
    );
    await queryRunner.query(
      'ALTER TABLE "recommendation_history" DROP COLUMN IF EXISTS "outcome"',
    );
    await queryRunner.query(
      'ALTER TABLE "recommendation_history" DROP COLUMN IF EXISTS "returnPct"',
    );
    await queryRunner.query(
      'ALTER TABLE "recommendation_history" DROP COLUMN IF EXISTS "currentPrice"',
    );
    await queryRunner.query('DROP TYPE IF EXISTS "public"."recommendation_outcome_enum"');
  }
}
