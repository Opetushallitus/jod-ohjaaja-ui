/// <reference types="vitest" />
import react from '@vitejs/plugin-react-swc';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

const cmsHeaders = (env: Record<string, string>) => ({
  Cookie: `JODTOKEN=${env.JODTOKEN}`,
  Accept: 'application/json',
  Authorization: 'Basic ' + Buffer.from(`${env.CMSUSER}:${env.CMSPASSWORD}`).toString('base64'),
});

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // loadEnv is required to read .env files
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.CMSURL;

  return {
    base: '/ohjaaja/',
    plugins: [react()],
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./vitest.setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['lcov'],
      },
    },
    resolve: {
      alias: [
        {
          find: '@',
          replacement: fileURLToPath(new URL('./src', import.meta.url)),
        },
      ],
    },
    server: {
      port: 8080,
      proxy: {
        '/ohjaaja/cms': {
          target,
          changeOrigin: true,
          xfwd: true,
          rewrite: (path) => path.replace(/^\/ohjaaja\/cms/, '/cms'),
          headers: cmsHeaders(env),
        },
        '/cms/documents': {
          target,
          changeOrigin: true,
          xfwd: true,
          headers: cmsHeaders(env),
        },
      },
    },
  };
});
