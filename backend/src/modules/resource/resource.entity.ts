import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('resources')
export class Resource {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'text', nullable: true })
  preview_url: string;

  @Column()
  type: string;

  @Column({ nullable: true })
  size: number;

  @Column({ nullable: true })
  mime_type: string;

  @Column({ nullable: true })
  uploader_id: string;

  @Column({ default: 0 })
  download_count: number;

  @Column({ type: 'text', nullable: true })
  detail: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
