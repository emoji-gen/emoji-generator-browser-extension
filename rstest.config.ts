import { defineConfig } from '@rstest/core';

export default defineConfig({
  testEnvironment: 'happy-dom',
  source: {
    define: {
      _DEBUG: 'true',
    },
  },
});
