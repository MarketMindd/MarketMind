import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
