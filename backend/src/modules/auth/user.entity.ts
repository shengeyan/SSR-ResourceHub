import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 50 })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true, length: 512 })
  avatar: string;

  @Column({ type: 'tinyint', default: 1 })
  isActive: boolean;

  @Column({ type: 'tinyint', default: 0 })
  emailVerified: boolean;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @Column({ type: 'datetime', nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
