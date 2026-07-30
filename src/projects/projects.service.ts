import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectMember } from '../entities';
import { ProjectRole, Role } from '../common/enums/role.enum';
import { UsersService } from '../users/users.service';
@Injectable()
export class ProjectsService {
  constructor(@InjectRepository(Project) private readonly projects: Repository<Project>, @InjectRepository(ProjectMember) private readonly members: Repository<ProjectMember>, private readonly users: UsersService) {}
  async create(dto: any, user: any) { const p = await this.projects.save(this.projects.create({ ...dto, ownerId: user.id })); await this.members.save(this.members.create({ projectId: p.id, userId: user.id, roleInProject: ProjectRole.OWNER })); return p; }
  async list(user: any) { if (user.role === Role.ADMIN) return this.projects.find({ order: { createdAt: 'DESC' } }); const rows = await this.members.find({ where: { userId: user.id } }); return rows.length ? this.projects.findByIds(rows.map(x => x.projectId)) : []; }
  async get(id: string, user: any) { const p = await this.projects.findOne({ where: { id } }); if (!p) throw new NotFoundException('Project not found'); await this.assertMember(id, user); return p; }
  async update(id: string, dto: any, user: any) { const p = await this.get(id, user); await this.assertManager(id, user, p); Object.assign(p, dto); return this.projects.save(p); }
  async remove(id: string) { const p = await this.projects.findOne({ where: { id } }); if (!p) throw new NotFoundException('Project not found'); await this.projects.softRemove(p); }
  async addMember(id: string, dto: any, user: any) { const p = await this.get(id, user); await this.assertManager(id, user, p); await this.users.findById(dto.userId) || (() => { throw new NotFoundException('User not found'); })(); const existing = await this.members.findOne({ where: { projectId: id, userId: dto.userId } }); if (existing) throw new ConflictException('Already a member'); return this.members.save(this.members.create({ projectId: id, userId: dto.userId, roleInProject: dto.roleInProject ?? ProjectRole.CONTRIBUTOR })); }
  async removeMember(id: string, userId: string, user: any) { const p = await this.get(id, user); await this.assertManager(id, user, p); const m = await this.members.findOne({ where: { projectId: id, userId } }); if (!m) throw new NotFoundException('Membership not found'); await this.members.remove(m); }
  async assertMember(id: string, user: any) { if (user.role === Role.ADMIN) return; if (!(await this.members.findOne({ where: { projectId: id, userId: user.id } }))) throw new ForbiddenException('Project membership required'); }
  private async assertManager(id: string, user: any, p: Project) { if (user.role === Role.ADMIN || p.ownerId === user.id) return; const m = await this.members.findOne({ where: { projectId: id, userId: user.id } }); if (!m || ![ProjectRole.OWNER, ProjectRole.MANAGER].includes(m.roleInProject)) throw new ForbiddenException('Project manager required'); }
}
