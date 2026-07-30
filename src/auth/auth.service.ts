import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'crypto';
import { RefreshToken, User } from '../entities';
import { Role } from '../common/enums/role.enum';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly users: UsersService, private readonly jwt: JwtService, private readonly config: ConfigService, @InjectRepository(RefreshToken) private readonly tokens: Repository<RefreshToken>) {}
  async register(dto: RegisterDto) {
    if (await this.users.findByEmail(dto.email)) throw new ConflictException('Email already registered');
    const user = await this.users.create({ email: dto.email, name: dto.name, role: dto.role ?? Role.DEVELOPER, passwordHash: await bcrypt.hash(dto.password, 10) });
    return this.issue(user);
  }
  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) throw new UnauthorizedException('Invalid credentials');
    return this.issue(user);
  }
  async refresh(raw: string) {
    let payload: any;
    try { payload = await this.jwt.verifyAsync(raw, { secret: this.config.get('jwt.refreshSecret') }); } catch { throw new UnauthorizedException('Invalid refresh token'); }
    const stored = await this.tokens.findOne({ where: { tokenHash: this.hash(raw), userId: payload.sub, revoked: false } });
    if (!stored || stored.expiresAt <= new Date()) throw new UnauthorizedException('Refresh token is no longer valid');
    stored.revoked = true; await this.tokens.save(stored);
    const user = await this.users.findById(payload.sub); if (!user) throw new UnauthorizedException('User not found');
    return this.issue(user);
  }
  async logout(raw: string) { await this.tokens.update({ tokenHash: this.hash(raw) }, { revoked: true }); }
  private async issue(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const expiry = this.config.get<string>('jwt.expiry') ?? '15m';
    const refreshExpiry = this.config.get<string>('jwt.refreshExpiry') ?? '7d';
    const accessToken = await this.jwt.signAsync(payload, { secret: this.config.get('jwt.secret'), expiresIn: expiry });
    const refreshToken = await this.jwt.signAsync({ ...payload, jti: randomUUID() }, { secret: this.config.get('jwt.refreshSecret'), expiresIn: refreshExpiry });
    await this.tokens.save(this.tokens.create({ userId: user.id, tokenHash: this.hash(refreshToken), expiresAt: new Date(Date.now() + 7 * 86400000), revoked: false }));
    return { accessToken, refreshToken, expiresIn: expiry, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  }
  private hash(value: string) { return createHash('sha256').update(value).digest('hex'); }
}
