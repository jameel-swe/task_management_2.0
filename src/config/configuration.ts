export default () => ({
  env: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/task_management',
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-access-secret',
    expiry: process.env.JWT_EXPIRY ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY ?? '7d'
  },
  temporal: {
    address: process.env.TEMPORAL_ADDRESS ?? 'localhost:7233',
    namespace: process.env.TEMPORAL_NAMESPACE ?? 'default',
    taskQueue: process.env.TEMPORAL_TASK_QUEUE ?? 'task-management'
  },
  demoFlakyActivities: process.env.DEMO_FLAKY_ACTIVITIES === 'true'
});
