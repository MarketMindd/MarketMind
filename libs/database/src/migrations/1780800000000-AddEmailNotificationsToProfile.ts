import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmailNotificationsToProfile1780800000000 implements MigrationInterface {
    name = 'AddEmailNotificationsToProfile1780800000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "user_profiles" ADD COLUMN "emailNotifications" boolean NOT NULL DEFAULT true');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "user_profiles" DROP COLUMN "emailNotifications"');
    }

}
