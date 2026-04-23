import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'symbol_filter_state' })
export class SymbolFilterStateEntity {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  stockSymbol!: string;

  @Column({ type: 'decimal', precision: 8, scale: 4, default: 0 })
  lastForwardedPriceChange!: number;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
