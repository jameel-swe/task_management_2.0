import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
@ApiTags('tasks') @ApiBearerAuth('access-token') @Controller('tasks')
export class TasksController {
  constructor(private readonly service: TasksService) {}
  @Post() create(@Body() dto: any, @CurrentUser() user: any) { return this.service.create(dto, user); }
  @Get() list(@Query() q: any, @CurrentUser() user: any) { return this.service.list(q, user); }
  @Get(':id') get(@Param('id') id: string, @CurrentUser() user: any) { return this.service.get(id, user); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) { return this.service.update(id, dto, user); }
  @Delete(':id') remove(@Param('id') id: string, @CurrentUser() user: any) { return this.service.remove(id, user); }
  @Post(':id/assign') assign(@Param('id') id: string, @Body('assigneeId') assigneeId: string | null, @CurrentUser() user: any) { return this.service.assign(id, assigneeId, user); }
  @Post(':id/submit-for-approval') submit(@Param('id') id: string, @Body('approverIds') approverIds: string[], @CurrentUser() user: any) { return this.service.submitApproval(id, approverIds, user); }
  @Patch(':id/approvals/:approvalId') decide(@Param('id') id: string, @Param('approvalId') approvalId: string, @Body() body: any) { return this.service.approvalDecision(id, approvalId, body.decision, body.comment); }
}
