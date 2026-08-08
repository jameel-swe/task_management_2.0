import { NativeConnection, Worker } from '@temporalio/worker';
import { config } from 'dotenv';
import * as activities from './activities/task.activities';
import AppDataSource from '../database/data-source';

config();

async function run() {
  if (!AppDataSource.isInitialized) await AppDataSource.initialize();
  const connection = await NativeConnection.connect({ address: process.env.TEMPORAL_ADDRESS ?? 'localhost:7233' });
  const worker = await Worker.create({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE ?? 'default',
    taskQueue: process.env.TEMPORAL_TASK_QUEUE ?? 'task-management',
    workflowsPath: require.resolve('./workflows'),
    activities,
  });
  await worker.run();
}

run().catch(async (error) => {
  console.error('Temporal worker failed to start', error);
  if (AppDataSource.isInitialized) await AppDataSource.destroy();
  process.exit(1);
});
