import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSharedAiSummaryCache1781300000000 implements MigrationInterface {
  name = 'AddSharedAiSummaryCache1781300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_profiles"
        ADD COLUMN IF NOT EXISTS "aiSummaryCache"   jsonb,
        ADD COLUMN IF NOT EXISTS "aiSummaryCachedAt" timestamptz
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_profiles"
        DROP COLUMN IF EXISTS "aiSummaryCachedAt",
        DROP COLUMN IF EXISTS "aiSummaryCache"
    `);
  }
}
