import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.int.test.ts', 'src/**/*.int.test.tsx'],
  },
}); 