import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PortfolioHoldingEntity } from './portfolio-holding.entity.js';

@Entity({ name: 'portfolios' })
export class PortfolioEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  userId!: string;

  @OneToMany(() => PortfolioHoldingEntity, (holding) => holding.portfolio)
  holdings!: PortfolioHoldingEntity[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
