import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'node:path';

// Load .env from the backend directory (where the process runs)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  HOST: z.string().default('0.0.0.0'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  MAX_TENDER_FILE_SIZE_MB: z.coerce.number().int().positive().default(50),

  DATABASE_URL: z.string().url().optional().or(z.literal('')),

  REDIS_URL: z.string().url().optional().or(z.literal('')),

  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  AUTH_ENFORCED: z.coerce.boolean().default(false),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
  AUTH_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),

  // Super Administrator credentials (configured via .env)
  SUPER_ADMIN_EMAIL: z.string().email().optional(),
  SUPER_ADMIN_PASSWORD: z.string().min(6).optional(),

  STORAGE_ENDPOINT: z.string().optional(),
  STORAGE_BUCKET: z.string().default('bidguard-documents'),
  STORAGE_ACCESS_KEY: z.string().optional(),
  STORAGE_SECRET_KEY: z.string().optional(),
  STORAGE_REGION: z.string().default('us-east-1'),

  LLM_PROVIDER: z.enum(['gemini', 'openai', 'mock']).default('mock'),
  LLM_API_KEY: z.string().optional(),
  LLM_MODEL: z.string().default('gemini-2.5-flash'),
  LLM_BASE_URL: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.NODE_ENV === 'production') {
    if (!data.DATABASE_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['DATABASE_URL'],
        message: 'DATABASE_URL is required in production',
      });
    }
    if (data.CORS_ORIGIN === '*') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['CORS_ORIGIN'],
        message: 'Wildcard CORS_ORIGIN is not permitted in production',
      });
    }
  }
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(rawEnv: Record<string, unknown> = process.env): Env {
  const result = envSchema.safeParse(rawEnv);
  if (!result.success) {
    const errorDetails = result.error.issues
      .map((issue) => `  - [${issue.path.join('.')}]: ${issue.message}`)
      .join('\n');
    console.error('Environment configuration validation failed:\n' + errorDetails);
    throw new Error(`Invalid environment configuration:\n${errorDetails}`);
  }
  return result.data;
}

export const env = validateEnv(process.env);
