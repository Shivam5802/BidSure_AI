import cluster from 'node:cluster';
import os from 'node:os';
import { buildApp } from './app.js';
import { env } from './config/env.js';
import { demoService } from './modules/demo/demo.service.js';

const isClusterEnabled =
  process.env.CLUSTER_MODE === 'true' ||
  (process.env.NODE_ENV === 'production' && !process.env.DISABLE_CLUSTER);

const numCPUs = process.env.WEB_CONCURRENCY
  ? parseInt(process.env.WEB_CONCURRENCY, 10)
  : Math.min(os.cpus().length, 8); // Cap at 8 workers per node instance

async function startWorker(): Promise<void> {
  const app = await buildApp();

  // If not running in cluster mode, seed demo dataset directly
  if (!isClusterEnabled) {
    try {
      const seedRes = await demoService.seedCanonicalDemo();
      app.log.info(
        { tenderId: seedRes.tenderId, referenceNumber: seedRes.referenceNumber },
        'Canonical demo dataset seeded on startup'
      );
    } catch (seedErr) {
      app.log.warn({ err: seedErr }, 'Failed to seed canonical demo dataset on startup');
    }
  }

  const shutdown = async (signal: string) => {
    app.log.info({ signal, pid: process.pid }, 'Graceful worker shutdown initiated');
    try {
      await app.close();
      app.log.info({ pid: process.pid }, 'Worker server successfully closed');
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
      `BidSure AI Backend worker (PID: ${process.pid}) running at ${address} (NODE_ENV: ${env.NODE_ENV})`
    );
    if (!isClusterEnabled || cluster.worker?.id === 1) {
      app.log.info(`OpenAPI docs: ${address}/api/docs`);
      app.log.info(`Health: ${address}/api/health`);
    }
  } catch (err) {
    app.log.fatal(err, 'Failed to start BidSure AI Backend server');
    process.exit(1);
  }
}

async function startMaster(): Promise<void> {
  console.log(`[Master ${process.pid}] Initializing BidSure AI Enterprise Cluster across ${numCPUs} CPU cores...`);

  // Canonical demo dataset seeded once by the primary process to prevent race conditions
  try {
    const seedRes = await demoService.seedCanonicalDemo();
    console.log(
      `[Master ${process.pid}] Canonical demo dataset verified (Tender: ${seedRes.referenceNumber})`
    );
  } catch (seedErr) {
    console.warn(`[Master ${process.pid}] Demo dataset seed note:`, seedErr);
  }

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.warn(
      `[Master ${process.pid}] Worker ${worker.process.pid} exited (code: ${code}, signal: ${signal}). Spawning replacement...`
    );
    cluster.fork();
  });

  const shutdownMaster = () => {
    console.log(`[Master ${process.pid}] Shutting down all cluster workers...`);
    for (const id in cluster.workers) {
      cluster.workers[id]?.kill('SIGTERM');
    }
    process.exit(0);
  };

  process.on('SIGTERM', shutdownMaster);
  process.on('SIGINT', shutdownMaster);
}

if (isClusterEnabled && cluster.isPrimary) {
  void startMaster();
} else {
  void startWorker();
}
