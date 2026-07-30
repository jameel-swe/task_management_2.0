import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshDto } from './dto/auth.dto';
import { Public } from '../common/decorators/public.decorator';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Public() @Post('register') register(@Body() dto: RegisterDto) { return this.auth.register(dto); }
  @Public() @Post('login') @HttpCode(HttpStatus.OK) login(@Body() dto: LoginDto) { return this.auth.login(dto); }
  @Public() @Post('refresh') @HttpCode(HttpStatus.OK) refresh(@Body() dto: RefreshDto) { return this.auth.refresh(dto.refreshToken); }
  @ApiBearerAuth('access-token') @Post('logout') @HttpCode(HttpStatus.OK) async logout(@Body() dto: RefreshDto) { await this.auth.logout(dto.refreshToken); return { message: 'Logged out' }; }
}
