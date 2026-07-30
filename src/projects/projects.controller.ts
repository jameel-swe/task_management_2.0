import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
@ApiTags('projects') @ApiBearerAuth('access-token') @Controller('projects')
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}
  @Post() @Roles(Role.ADMIN, Role.PROJECT_MANAGER) create(@Body() dto: any, @CurrentUser() user: any) { return this.service.create(dto, user); }
  @Get() list(@CurrentUser() user: any) { return this.service.list(user); }
  @Get(':id') get(@Param('id') id: string, @CurrentUser() user: any) { return this.service.get(id, user); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) { return this.service.update(id, dto, user); }
  @Delete(':id') @Roles(Role.ADMIN) remove(@Param('id') id: string) { return this.service.remove(id); }
  @Post(':id/members') @Roles(Role.ADMIN, Role.PROJECT_MANAGER) addMember(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) { return this.service.addMember(id, dto, user); }
  @Delete(':id/members/:userId') @Roles(Role.ADMIN, Role.PROJECT_MANAGER) removeMember(@Param('id') id: string, @Param('userId') userId: string, @CurrentUser() user: any) { return this.service.removeMember(id, userId, user); }
}
