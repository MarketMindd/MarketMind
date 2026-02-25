import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PortfolioEntity } from './portfolio.entity.js';

@Entity({ name: 'portfolio_holdings' })
@Index('UQ_portfolio_holdings_portfolioId_symbol', ['portfolioId', 'symbol'], {
  unique: true,
})
export class PortfolioHoldingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  portfolioId!: string;

  @ManyToOne(() => PortfolioEntity, (portfolio) => portfolio.holdings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'portfolioId' })
  portfolio!: PortfolioEntity;

  @Column({ type: 'varchar', length: 12 })
  symbol!: string;

  @Column({ type: 'varchar', length: 255 })
  companyName!: string;

  @Column({ type: 'numeric', precision: 18, scale: 6 })
  shares!: string;

  @Column({ type: 'numeric', precision: 18, scale: 6 })
  avgCost!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
