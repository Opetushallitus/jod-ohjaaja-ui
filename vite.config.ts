import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // loadEnv is required to read .env files
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: '/ohjaaja/',
    plugins: [react(), tailwindcss()],
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
      port: 8180,
      proxy: {
        '/ohjaaja/cms': {
          target: env.CMSURL,
          changeOrigin: true,
          headers: {
            Cookie: `JODTOKEN=${env.JODTOKEN}`,
          },
          auth: `${env.CMSUSER}:${env.CMSPASSWORD}`,
        },
      },
    },
  };
});
