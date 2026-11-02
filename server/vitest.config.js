import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    env: { NODE_ENV: 'test' },
    // first run downloads a MongoDB binary for mongodb-memory-server
    hookTimeout: 120_000,
  },
});
