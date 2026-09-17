import { buildApp } from './app.js';
import { env } from './config/env.js';
import { demoService } from './modules/demo/demo.service.js';

async function startServer(): Promise<void> {
  const app = await buildApp();

  // Auto-seed canonical demo dataset on startup
  try {
    const seedRes = await demoService.seedCanonicalDemo();
    app.log.info(
      { tenderId: seedRes.tenderId, referenceNumber: seedRes.referenceNumber },
      '✓ Canonical demo dataset seeded on startup'
    );
  } catch (seedErr) {
    app.log.warn({ err: seedErr }, 'Failed to seed canonical demo dataset on startup');
  }

  const shutdown = async (signal: string) => {
    app.log.info({ signal }, 'Graceful shutdown initiated');
    try {
      await app.close();
      app.log.info('Server successfully closed');
      process.exit(0);
    } catch (err) {
      app.log.error(err, 'Error during graceful shutdown');
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  try {
    const address = await app.listen({ port: env.PORT, host: env.HOST });
    app.log.info(
      `🚀 BidGuard AI Backend running at ${address} (Environment: ${env.NODE_ENV})`
    );
    app.log.info(`📖 OpenAPI Docs available at ${address}/api/docs`);
    app.log.info(`🩺 Health endpoint at ${address}/api/health`);
  } catch (err) {
    app.log.fatal(err, 'Failed to start BidGuard AI Backend server');
    process.exit(1);
  }
}

void startServer();
