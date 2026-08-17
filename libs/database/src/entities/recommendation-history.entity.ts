import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { RecommendationOutcome, RiskTolerance } from '@market-mind/common';
import type { RecommendationStatus } from '@market-mind/common';

@Entity({ name: 'recommendation_history' })
export class RecommendationHistoryEntity {
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

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  entryPrice!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  currentPrice!: number | null;

  @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
  returnPct!: number | null;

  @Column({
    type: 'enum',
    enum: RecommendationOutcome,
    enumName: 'recommendation_outcome_enum',
    nullable: true,
  })
  outcome!: RecommendationOutcome | null;

  @Column({ type: 'boolean', default: false })
  isFrozen!: boolean;
}
