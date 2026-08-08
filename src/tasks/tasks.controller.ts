import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TaskAccessGuard } from './guards/task-access.guard';
import { CreateTaskDto, UpdateTaskDto, AssignTaskDto, SubmitApprovalDto, ApprovalDecisionDto, QueryTasksDto } from './dto/task.dto';
@ApiTags('tasks') @ApiBearerAuth('access-token') @Controller('tasks')
export class TasksController {
  constructor(private readonly service: TasksService) {}
  @Post() create(@Body() dto: CreateTaskDto, @CurrentUser() user: any) { return this.service.create(dto, user); }
  @Get() list(@Query() q: QueryTasksDto, @CurrentUser() user: any) { return this.service.list(q, user); }
  @Get(':id') get(@Param('id') id: string, @CurrentUser() user: any) { return this.service.get(id, user); }
  @Patch(':id') @UseGuards(TaskAccessGuard) update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @CurrentUser() user: any) { return this.service.update(id, dto, user); }
  @Delete(':id') @UseGuards(TaskAccessGuard) remove(@Param('id') id: string, @CurrentUser() user: any) { return this.service.remove(id, user); }
  @Post(':id/assign') @UseGuards(TaskAccessGuard) assign(@Param('id') id: string, @Body() dto: AssignTaskDto, @CurrentUser() user: any) { return this.service.assign(id, dto.assigneeId, user); }
  @Post(':id/submit-for-approval') @UseGuards(TaskAccessGuard) submit(@Param('id') id: string, @Body() dto: SubmitApprovalDto, @CurrentUser() user: any) { return this.service.submitApproval(id, dto.approverIds, user); }
  @Patch(':id/approvals/:approvalId') decide(@Param('id') id: string, @Param('approvalId') approvalId: string, @Body() dto: ApprovalDecisionDto, @CurrentUser() user: any) { return this.service.approvalDecision(id, approvalId, dto.decision, dto.comment, user); }
  @Get(':id/workflow-status') status(@Param('id') id: string, @CurrentUser() user: any) { return this.service.workflowStatus(id, user); }
}
