import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RiskTolerance } from '@market-mind/common';
import { SectorInterest } from '@market-mind/common';

@Entity({ name: 'user_profiles' })
export class UserProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;
  @Column({ type: 'varchar', length: 255 })
  fullName!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({
    type: 'enum',
    enum: RiskTolerance,
    default: RiskTolerance.MEDIUM,
  })
  riskTolerance!: RiskTolerance;

  @Column({
    type: 'enum',
    enum: SectorInterest,
    array: true,
    default: '{}',
  })
  interests!: SectorInterest[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @Column({ type: 'text', array: true, default: [] })
  refreshTokens!: string[];
}
