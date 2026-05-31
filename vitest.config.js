import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/parsers/**/*.test.js'],
    globals: true,
    testTimeout: 10000
  }
});
