import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRecommendations1777200000000 implements MigrationInterface {
  name = 'AddRecommendations1777200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TYPE \"public\".\"recommendation_status_enum\" AS ENUM('Invest', 'Hold', 'Exit')",
    );
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "recommendations" (
        "id"              uuid                                          NOT NULL DEFAULT gen_random_uuid(),
        "stockSymbol"     character varying(20)                        NOT NULL,
        "riskTolerance"   "public"."user_profiles_riskTolerance_enum"  NOT NULL,
        "status"          "public"."recommendation_status_enum"         NOT NULL,
        "confidenceScore" numeric(4,3)                                 NOT NULL,
        "rationale"       text                                         NOT NULL,
        "createdAt"       TIMESTAMP WITH TIME ZONE                     NOT NULL DEFAULT now(),
        "updatedAt"       TIMESTAMP WITH TIME ZONE                     NOT NULL DEFAULT now(),
        CONSTRAINT "PK_recommendations_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_recommendations_symbol_risk" UNIQUE ("stockSymbol", "riskTolerance"),
        CONSTRAINT "FK_recommendations_stockSymbol" FOREIGN KEY ("stockSymbol")
          REFERENCES "stocks"("symbol") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(
      'CREATE INDEX "IDX_recommendations_stockSymbol" ON "recommendations" ("stockSymbol")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "public"."IDX_recommendations_stockSymbol"');
    await queryRunner.query('DROP TABLE IF EXISTS "recommendations"');
    await queryRunner.query('DROP TYPE IF EXISTS "public"."recommendation_status_enum"');
  }
}
