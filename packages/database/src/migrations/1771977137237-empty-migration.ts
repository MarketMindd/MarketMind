import { MigrationInterface, QueryRunner } from "typeorm";

export class EmptyMigration1771977137237 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
