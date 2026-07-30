import { NativeConnection, Worker } from '@temporalio/worker';
import { config } from 'dotenv';
import * as activities from './activities/task.activities';
config();
async function run() {
  const connection = await NativeConnection.connect({ address: process.env.TEMPORAL_ADDRESS ?? 'localhost:7233' });
  const worker = await Worker.create({ connection, namespace: process.env.TEMPORAL_NAMESPACE ?? 'default', taskQueue: process.env.TEMPORAL_TASK_QUEUE ?? 'task-management', workflowsPath: require.resolve('./workflows'), activities });
  await worker.run();
}
run().catch((error) => { console.error(error); process.exit(1); });
