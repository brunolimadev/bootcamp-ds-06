import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export default class AlterTransactionsTableTypeValueField1593639631163
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'transactions',
      'value',
      new TableColumn({
        name: 'value',
        type: 'float',
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'transactions',
      'transactions',
      new TableColumn({
        name: 'value',
        type: 'numeric(10,2)',
        isNullable: false,
      }),
    );
  }
}
