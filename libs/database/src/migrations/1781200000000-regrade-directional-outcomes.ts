import { MigrationInterface, QueryRunner } from 'typeorm';

export class RegradeDirectionalOutcomes1781200000000 implements MigrationInterface {
  name = 'RegradeDirectionalOutcomes1781200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "recommendation_history"
      SET "outcome" = CASE
        WHEN "returnPct" = 0 THEN 'N/A'
        WHEN "status" = 'Hold' THEN
          CASE WHEN ABS("returnPct") <= 5 THEN 'Success' ELSE 'Miss' END
        WHEN "status" IN ('Invest', 'Exit') AND ABS("returnPct") <= 1 THEN 'N/A'
        WHEN "status" = 'Invest' THEN
          CASE WHEN "returnPct" > 1 THEN 'Success' ELSE 'Miss' END
        WHEN "status" = 'Exit' THEN
          CASE WHEN "returnPct" < -1 THEN 'Success' ELSE 'Miss' END
        ELSE 'N/A'
      END::"public"."recommendation_outcome_enum"
      WHERE "returnPct" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "recommendation_history"
      SET "outcome" = CASE
        WHEN "returnPct" = 0 THEN 'N/A'
        WHEN "status" = 'Hold' THEN
          CASE WHEN ABS("returnPct") <= 5 THEN 'Success' ELSE 'Miss' END
        WHEN "status" = 'Invest' THEN
          CASE WHEN "returnPct" > -1 THEN 'Success' ELSE 'Miss' END
        WHEN "status" = 'Exit' THEN
          CASE WHEN "returnPct" < 1 THEN 'Success' ELSE 'Miss' END
        ELSE 'N/A'
      END::"public"."recommendation_outcome_enum"
      WHERE "returnPct" IS NOT NULL
    `);
  }
}
