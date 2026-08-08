import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectMember, Task } from '../../entities';
import { ProjectRole, Role } from '../../common/enums/role.enum';

@Injectable()
export class TaskAccessGuard implements CanActivate {
  constructor(@InjectRepository(Task) private readonly tasks: Repository<Task>, @InjectRepository(ProjectMember) private readonly members: Repository<ProjectMember>) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const task = await this.tasks.findOne({ where: { id: request.params.id } });
    if (!task) throw new NotFoundException('Task not found');
    request.task = task;
    if (user.role === Role.ADMIN || task.assigneeId === user.id) return true;
    const membership = await this.members.findOne({ where: { projectId: task.projectId, userId: user.id } });
    if (membership && [ProjectRole.OWNER, ProjectRole.MANAGER].includes(membership.roleInProject)) return true;
    throw new ForbiddenException('Task owner or project manager required');
  }
}
