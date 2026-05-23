import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RiskTolerance } from '@market-mind/common';
import type { RecommendationStatus } from '@market-mind/common';

@Entity({ name: 'recommendations' })
export class RecommendationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 20 })
  stockSymbol!: string;

  @Column({ type: 'enum', enum: RiskTolerance, enumName: 'user_profiles_riskTolerance_enum' })
  riskTolerance!: RiskTolerance;

  @Column({
    type: 'enum',
    enum: ['Invest', 'Hold', 'Exit'],
    enumName: 'recommendation_status_enum',
  })
  status!: RecommendationStatus;

  @Column({ type: 'decimal', precision: 4, scale: 3 })
  confidenceScore!: number;

  @Column({ type: 'text' })
  rationale!: string;

  @Column({ type: 'text', nullable: true })
  aiSummary!: string | null;

  @Column({ type: 'text', nullable: true })
  shortTermOutlook!: string | null;

  @Column({ type: 'text', nullable: true })
  longTermOutlook!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
