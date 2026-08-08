import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLog, ProjectMember, Task, TaskApproval } from '../entities';
import { ProjectsModule } from '../projects/projects.module';
import { TemporalModule } from '../temporal/temporal.module';
import { UsersModule } from '../users/users.module';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TaskAccessGuard } from './guards/task-access.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Task, TaskApproval, ActivityLog, ProjectMember]), ProjectsModule, TemporalModule, UsersModule],
  providers: [TasksService, TaskAccessGuard],
  controllers: [TasksController],
  exports: [TasksService]
})
export class TasksModule {}
