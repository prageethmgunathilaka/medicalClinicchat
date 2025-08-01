import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.int.test.ts', 'src/**/*.int.test.tsx'],
    testTimeout: 15000,
  },
}); 