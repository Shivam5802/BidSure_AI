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

  let seedInfo: { tenderId: string; referenceNumber: string } | null = null;

  // If not running in cluster mode, seed demo dataset directly
  if (!isClusterEnabled) {
    try {
      const seedRes = await demoService.seedCanonicalDemo();
      seedInfo = seedRes;
    } catch (seedErr: any) {
      console.warn('Demo seed notice:', seedErr?.message || seedErr);
    }
  }

  const shutdown = async (signal: string) => {
    console.log(`\nShutting down gracefully (${signal})...`);
    try {
      await app.close();
      console.log('BidSure AI Backend closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    
    if (!isClusterEnabled || cluster.worker?.id === 1) {
      const localUrl = `http://localhost:${env.PORT}`;
      const docsUrl = `${localUrl}/api/docs`;
      const healthUrl = `${localUrl}/api/health`;
      const cyan = '\x1b[36m';
      const green = '\x1b[32m';
      const yellow = '\x1b[33m';
      const blue = '\x1b[34m';
      const bold = '\x1b[1m';
      const dim = '\x1b[90m';
      const reset = '\x1b[0m';

      console.log(`
${cyan}${bold}  ┌─────────────────────────────────────────────────────────────┐${reset}
${cyan}${bold}  │                                                             │${reset}
${cyan}${bold}  │   🛡️   B I D S U R E  A I   —   B A C K E N D   S U I T E    │${reset}
${cyan}${bold}  │   ${dim}Sovereign Public Procurement Intelligence & AI Engine${reset}${cyan}${bold}     │${reset}
${cyan}${bold}  │                                                             │${reset}
${cyan}${bold}  ├─────────────────────────────────────────────────────────────┤${reset}
${cyan}${bold}  │${reset}  ${bold}• Status${reset}       :  ${green}Ready & Operational${reset}                   ${cyan}${bold}│${reset}
${cyan}${bold}  │${reset}  ${bold}• Environment${reset}  :  ${yellow}${env.NODE_ENV.padEnd(33)}${reset}${cyan}${bold}│${reset}
${cyan}${bold}  │${reset}  ${bold}• Local API${reset}    :  ${bold}${localUrl.padEnd(33)}${reset}${cyan}${bold}│${reset}
${cyan}${bold}  │${reset}  ${bold}• OpenAPI Docs${reset} :  ${blue}${docsUrl.padEnd(33)}${reset}${cyan}${bold}│${reset}
${cyan}${bold}  │${reset}  ${bold}• Health Check${reset} :  ${green}${healthUrl.padEnd(33)}${reset}${cyan}${bold}│${reset}
${cyan}${bold}  │${reset}  ${bold}• Storage Mode${reset} :  ${(process.env.DATABASE_URL ? 'Hybrid (PostgreSQL + In-Memory)' : 'In-Memory (Local Demo)').padEnd(33)}${cyan}${bold}│${reset}
${cyan}${bold}  │${reset}  ${bold}• Demo Tender${reset}  :  ${yellow}${(seedInfo ? `${seedInfo.referenceNumber} (Seeded)` : 'Canonical Dataset Active').padEnd(33)}${reset}${cyan}${bold}│${reset}
${cyan}${bold}  │                                                             │${reset}
${cyan}${bold}  └─────────────────────────────────────────────────────────────┘${reset}
`);
    }
  } catch (err) {
    console.error('Failed to start BidSure AI Backend server:', err);
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
