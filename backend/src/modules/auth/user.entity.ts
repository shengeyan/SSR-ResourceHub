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
  id: string; // 使用 UUID 作为主键

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 50 })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true, length: 512 })
  avatar: string; // 用户头像 URL，可为空

  @Column({ type: 'tinyint', default: 1 })
  isActive: boolean; // 是否激活账户

  @Column({ type: 'tinyint', default: 0 })
  emailVerified: boolean; // 是否验证邮箱

  @Column({ type: 'tinyint', default: 1 })
  status: number; // 1=正常, 0=禁用

  @Column({ type: 'datetime', nullable: true })
  lastLoginAt: Date; // 最后登录时间

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
