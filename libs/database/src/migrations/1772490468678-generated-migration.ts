import { MigrationInterface, QueryRunner } from 'typeorm';

export class GeneratedMigration1772490468678 implements MigrationInterface {
  name = 'GeneratedMigration1772490468678';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "user_profiles" DROP COLUMN "displayName"');
    await queryRunner.query(
      'ALTER TABLE "user_profiles" ADD "fullName" character varying(255) NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "user_profiles" ADD "password" character varying(255) NOT NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "user_profiles" DROP COLUMN "password"');
    await queryRunner.query('ALTER TABLE "user_profiles" DROP COLUMN "fullName"');
    await queryRunner.query(
      'ALTER TABLE "user_profiles" ADD "displayName" character varying(120) NOT NULL',
    );
  }
}
