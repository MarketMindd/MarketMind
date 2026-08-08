import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRecommendationHistory1781000000000 implements MigrationInterface {
  name = 'AddRecommendationHistory1781000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "recommendation_history" (
        "id"              uuid                                         NOT NULL DEFAULT gen_random_uuid(),
        "stockSymbol"     character varying(20)                       NOT NULL,
        "riskTolerance"   "public"."user_profiles_riskTolerance_enum" NOT NULL,
        "status"          "public"."recommendation_status_enum"        NOT NULL,
        "confidenceScore" numeric(4,3)                                NOT NULL,
        "entryPrice"      numeric(15,4)                               NOT NULL,
        "createdAt"       TIMESTAMP WITH TIME ZONE                    NOT NULL DEFAULT now(),
        CONSTRAINT "PK_recommendation_history_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      'CREATE INDEX "IDX_rec_history_symbol_risk_created" ON "recommendation_history" ("stockSymbol", "riskTolerance", "createdAt" DESC)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "public"."IDX_rec_history_symbol_risk_created"');
    await queryRunner.query('DROP TABLE IF EXISTS "recommendation_history"');
  }
}
