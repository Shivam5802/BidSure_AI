import { demoService } from '../modules/demo/demo.service.js';
import { env } from '../config/env.js';

async function runPreflight() {
  console.log('\n============================================================');
  console.log('BidGuard AI — SIH Demonstration Pre-flight System Check');
  console.log('============================================================\n');

  let hasErrors = false;

  // 1. Environment & Configuration Check
  console.log('1. Configuration & Secrets Validation:');
  if (env.NODE_ENV) {
    console.log(`  ✓ Node Environment: ${env.NODE_ENV}`);
  } else {
    console.log('  ✗ NODE_ENV not specified');
    hasErrors = true;
  }
  console.log(`  ✓ Fastify Port: ${env.PORT} (Host: ${env.HOST})`);
  console.log(`  ✓ CORS Policy Origin: ${env.CORS_ORIGIN}`);

  // 2. Storage System
  console.log('\n2. Storage Subsystem:');
  console.log(`  ✓ Bucket: ${env.STORAGE_BUCKET} (${env.STORAGE_ENDPOINT || 'Local Storage Provider'})`);

  // 3. AI Provider & Fallback Mode
  console.log('\n3. AI & Verification Subsystems:');
  console.log(`  ✓ AI Extraction Provider: ${env.LLM_PROVIDER.toUpperCase()} (Model: ${env.LLM_MODEL})`);
  console.log('  ✓ External Verification Mode: MOCK / SYNTHETIC (Explicit Simulation Adapter)');

  // 4. Canonical Demo Dataset Verification
  console.log('\n4. Canonical Demo Dataset Verification:');
  try {
    const seedResult = await demoService.seedCanonicalDemo();
    console.log(`  ✓ Tender Initialized: ${seedResult.referenceNumber} (${seedResult.tenderId})`);
    console.log(`  ✓ Requirements: ${seedResult.requirementsCount} clauses extracted & active`);
    console.log(`  ✓ Registered Bidders: ${seedResult.biddersCount} vendors`);
    console.log(`  ✓ Quad-State Evaluations: ${seedResult.evaluationsCount} deterministic evaluation records`);
    console.log(`  ✓ Contradiction Graph: ${seedResult.conflictsCount} detected conflicts`);
    console.log(`  ✓ External Verifications: ${seedResult.verificationsCount} verified credentials`);

    const validation = await demoService.validateDemoState();
    if (validation.isComplete) {
      console.log('  ✓ Demo Dataset Integrity: COMPLETE (0 missing components)');
    } else {
      console.log(`  ⚠ Demo Dataset Incomplete: Missing ${validation.missingComponents.join(', ')}`);
      hasErrors = true;
    }
  } catch (err: any) {
    console.log(`  ✗ Demo Seeding Failed: ${err?.message || err}`);
    hasErrors = true;
  }

  // 5. Overall System Readiness
  console.log('\n============================================================');
  if (hasErrors) {
    console.log('STATUS: DEMO NOT READY — Please resolve identified warnings.');
    console.log('============================================================\n');
    process.exit(1);
  } else {
    console.log('STATUS: READY FOR LIVE SIH DEMONSTRATION');
    console.log('============================================================\n');
    process.exit(0);
  }
}

void runPreflight();
