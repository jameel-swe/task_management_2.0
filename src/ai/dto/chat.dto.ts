import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class ChatDto {
  @ApiProperty({ example: 'Create a high priority task called Fix login bug in project 3c3...' })
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  message: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Stable ID for in-memory multi-turn context.' })
  @IsOptional()
  @IsUUID()
  conversationId?: string;
}
