import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    passWithNoTests: true,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: '',
      JWT_SECRET: 'vitest-test-secret-minimum-16-chars',
    },
  },
});
