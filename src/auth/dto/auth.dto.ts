import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsJWT, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Role } from '../../common/enums/role.enum';
export class RegisterDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty({ minLength: 8 }) @IsString() @MinLength(8) @MaxLength(72) password: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(120) name: string;
  @ApiPropertyOptional({ enum: Role }) @IsOptional() @IsEnum(Role) role?: Role;
}
export class LoginDto { @ApiProperty() @IsEmail() email: string; @ApiProperty() @IsString() password: string; }
export class RefreshDto { @ApiProperty() @IsJWT() refreshToken: string; }
export class AuthResponseDto { @ApiProperty() accessToken: string; @ApiProperty() refreshToken: string; @ApiProperty() expiresIn: string; @ApiProperty() user: { id: string; email: string; name: string; role: Role }; }
