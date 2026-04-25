import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'market_data' })
export class MarketDataEntity {
  @PrimaryColumn({ type: 'timestamptz' })
  time!: Date;

  @PrimaryColumn({ type: 'varchar', length: 20 })
  stockSymbol!: string;

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  price!: number;

  @Column({ type: 'bigint' })
  volume!: number;

  @Column({ type: 'decimal', precision: 8, scale: 4, default: 0 })
  priceChange!: number;
}
