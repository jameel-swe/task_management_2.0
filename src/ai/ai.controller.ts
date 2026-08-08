import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { ChatDto } from './dto/chat.dto';
import { AiService } from './ai.service';

@ApiTags('ai')
@ApiBearerAuth('access-token')
@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}
  @Post('chat')
  @ApiOperation({ summary: 'Chat with the authenticated task assistant', description: 'The assistant can only invoke existing task service operations and inherits REST authorization.' })
  @ApiOkResponse({ description: '{ conversationId, reply, actionTaken }' })
  chat(@Body() dto: ChatDto, @CurrentUser() user: AuthenticatedUser) { return this.ai.chat(user, dto.message, dto.conversationId); }
}
