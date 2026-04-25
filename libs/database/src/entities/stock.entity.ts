import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'stocks' })
export class StockEntity {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  symbol!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 100 })
  sector!: string;
}
