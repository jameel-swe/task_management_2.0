import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { TasksModule } from '../tasks/tasks.module';
import { UsersModule } from '../users/users.module';

@Module({ imports: [TasksModule, UsersModule], controllers: [AiController], providers: [AiService] })
export class AiModule {}
