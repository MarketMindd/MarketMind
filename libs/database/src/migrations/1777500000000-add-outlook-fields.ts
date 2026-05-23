import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOutlookFields1777500000000 implements MigrationInterface {
  name = 'AddOutlookFields1777500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "recommendations"
        ADD COLUMN IF NOT EXISTS "aiSummary"        text,
        ADD COLUMN IF NOT EXISTS "shortTermOutlook" text,
        ADD COLUMN IF NOT EXISTS "longTermOutlook"  text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "recommendations" DROP COLUMN IF EXISTS "longTermOutlook"',
    );
    await queryRunner.query(
      'ALTER TABLE "recommendations" DROP COLUMN IF EXISTS "shortTermOutlook"',
    );
    await queryRunner.query('ALTER TABLE "recommendations" DROP COLUMN IF EXISTS "aiSummary"');
  }
}
