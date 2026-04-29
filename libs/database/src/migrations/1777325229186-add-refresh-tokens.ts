import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefreshTokens1777325229186 implements MigrationInterface {
  name = 'AddRefreshTokens1777325229186';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "user_profiles" ADD "refreshTokens" text array NOT NULL DEFAULT \'{}\'',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "user_profiles" DROP COLUMN "refreshTokens"');
  }
}
