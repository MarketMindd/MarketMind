import { MigrationInterface, QueryRunner } from 'typeorm';

export class EmptyMigration1771977137237 implements MigrationInterface {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async up(_queryRunner: QueryRunner): Promise<void> {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
