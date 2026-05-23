import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserInterests1777500000000 implements MigrationInterface {
  name = 'AddUserInterests1777500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TYPE \"public\".\"user_profiles_interests_enum\" AS ENUM('Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer', 'Industrial', 'RealEstate', 'Materials')",
    );
    await queryRunner.query(
      'ALTER TABLE "user_profiles" ADD "interests" "public"."user_profiles_interests_enum" array NOT NULL DEFAULT \'{}\'',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "user_profiles" DROP COLUMN "interests"');
    await queryRunner.query('DROP TYPE IF EXISTS "public"."user_profiles_interests_enum"');
  }
}
