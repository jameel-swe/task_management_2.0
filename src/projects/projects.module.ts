import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project, ProjectMember } from '../entities';
import { UsersModule } from '../users/users.module';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
@Module({ imports: [TypeOrmModule.forFeature([Project, ProjectMember]), UsersModule], providers: [ProjectsService], controllers: [ProjectsController], exports: [ProjectsService] })
export class ProjectsModule {}
