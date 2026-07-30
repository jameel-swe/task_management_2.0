import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { TaskPriority, TaskStatus } from '../common/enums/task.enum';

@Entity('tasks')
@Index(['status', 'priority'])
@Index(['projectId'])
@Index(['assigneeId'])
export class Task {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ length: 200 }) title: string;
  @Column({ type: 'text', nullable: true }) description: string | null;
  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.TODO }) status: TaskStatus;
  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM }) priority: TaskPriority;
  @Column({ name: 'project_id', type: 'uuid' }) projectId: string;
  @Index() @Column({ name: 'assignee_id', type: 'uuid', nullable: true }) assigneeId: string | null;
  @Index() @Column({ name: 'due_date', type: 'timestamptz', nullable: true }) dueDate: Date | null;
  @Column({ name: 'approval_workflow_id', nullable: true }) approvalWorkflowId: string | null;
  @Column({ name: 'escalation_workflow_id', nullable: true }) escalationWorkflowId: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt: Date;
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true }) deletedAt: Date | null;
}
