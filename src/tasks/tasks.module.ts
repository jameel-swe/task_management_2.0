import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLog, ProjectMember, Task, TaskApproval } from '../entities';
import { ProjectsModule } from '../projects/projects.module';
import { TemporalModule } from '../temporal/temporal.module';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
@Module({ imports: [TypeOrmModule.forFeature([Task, TaskApproval, ActivityLog, ProjectMember]), ProjectsModule, TemporalModule], providers: [TasksService], controllers: [TasksController] })
export class TasksModule {}
