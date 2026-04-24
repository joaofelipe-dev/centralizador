import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['.orchestrator/**/*.test.js'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['.orchestrator/router/**/*.js'],
      exclude: ['**/*.test.js', '**/node_modules/**']
    }
  }
});