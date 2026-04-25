import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'portfolios' })
export class PortfolioEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 20 })
  stockSymbol!: string;

  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  shares!: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  avgPrice!: number;
}
