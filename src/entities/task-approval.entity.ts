import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { ApprovalStatus } from '../common/enums/task.enum';

@Entity('task_approvals')
@Index(['taskId'])
export class TaskApproval {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'task_id', type: 'uuid' }) taskId: string;
  @Column({ name: 'approver_id', type: 'uuid' }) approverId: string;
  @Column({ type: 'enum', enum: ApprovalStatus, default: ApprovalStatus.PENDING }) status: ApprovalStatus;
  @Column({ name: 'step_order', default: 0 }) stepOrder: number;
  @Column({ type: 'text', nullable: true }) comment: string | null;
  @Column({ name: 'decided_at', type: 'timestamptz', nullable: true }) decidedAt: Date | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
}
