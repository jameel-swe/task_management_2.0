import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { Inject } from '@nestjs/common';
@ApiTags('health') @Controller('health')
export class HealthController {
  constructor(private readonly db: DataSource) {}
  @Get()
  async check() { let database = 'up'; try { await this.db.query('SELECT 1'); } catch { database = 'down'; } return { status: database === 'up' ? 'ok' : 'degraded', database, temporal: 'configured', timestamp: new Date().toISOString() }; }
}
