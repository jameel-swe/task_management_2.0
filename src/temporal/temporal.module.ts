import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, Client } from '@temporalio/client';
import { TemporalService } from './temporal.service';
@Global()
@Module({ providers: [{ provide: 'TEMPORAL_CLIENT', inject: [ConfigService], useFactory: async (config: ConfigService) => { const connection = await Connection.connect({ address: config.get('temporal.address') }); return new Client({ connection, namespace: config.get('temporal.namespace') }); } }, TemporalService], exports: [TemporalService] })
export class TemporalModule {}
