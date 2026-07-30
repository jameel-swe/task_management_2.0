import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { ProjectRole } from '../common/enums/role.enum';

@Entity('project_members')
@Unique(['projectId', 'userId'])
export class ProjectMember {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column({ name: 'project_id', type: 'uuid' }) projectId: string;
  @Index() @Column({ name: 'user_id', type: 'uuid' }) userId: string;
  @Column({ name: 'role_in_project', type: 'enum', enum: ProjectRole, default: ProjectRole.CONTRIBUTOR }) roleInProject: ProjectRole;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
}
