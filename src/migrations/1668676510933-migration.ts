import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1668676510933 implements MigrationInterface {
    name = 'migration1668676510933'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "verificationCode" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "verificationCode"`);
    }

}
