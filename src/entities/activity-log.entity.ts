import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('activity_logs')
@Index(['taskId', 'createdAt'])
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'task_id', type: 'uuid' }) taskId: string;
  @Column({ name: 'user_id', type: 'uuid', nullable: true }) userId: string | null;
  @Column({ length: 80 }) action: string;
  @Column({ name: 'old_value', type: 'text', nullable: true }) oldValue: string | null;
  @Column({ name: 'new_value', type: 'text', nullable: true }) newValue: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
}
