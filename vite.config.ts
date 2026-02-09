import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

// The target API base URL
const target = process.env.API_BASE_URL ?? 'http://localhost:9180';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // loadEnv is required to read .env files
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: '/ohjaaja/',
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'serve-notifications-json',
        configureServer(server) {
          server.middlewares.use('/ohjaaja/config/notifications.json', (_, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify([
                {
                  id: 'test-notification',
                  title: { fi: 'Testi-ilmoitus', sv: 'Testnotis', en: 'Test notification' },
                  description: {
                    fi: 'Tämä on testi-ilmoitus.',
                    sv: 'Detta är en testnotis.',
                    en: 'This is a test notification.',
                  },
                  variant: 'success' as const,
                  link: {
                    label: { fi: 'Lue lisää', sv: 'Läs mer', en: 'Read more' },
                    url: {
                      fi: 'http://localhost:8080/ohjaaja/fi',
                      sv: 'http://localhost:8080/ohjaaja/sv',
                      en: 'http://localhost:8080/ohjaaja/en',
                    },
                  },
                },
              ]),
            );
          });
        },
      },
    ],
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./vitest.setup.ts', './src/i18n/config.ts'],
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
        '/ohjaaja/api': {
          target,
          xfwd: true,
        },
        '/ohjaaja/login': {
          target,
          xfwd: true,
        },
        '/ohjaaja/saml2': {
          target,
          xfwd: true,
        },
        '/ohjaaja/logout': {
          target,
          xfwd: true,
        },
        '/ohjaaja/openapi': {
          target,
          xfwd: true,
        },
        '/ohjaaja/cms': {
          target: env.CMSURL,
          changeOrigin: true,
          headers: {
            Cookie: `JODTOKEN=${env.JODTOKEN}`,
          },
          auth: `${env.CMSUSER}:${env.CMSPASSWORD}`,
        },
        '/api': {
          target: 'https://jodkehitys.fi',
          changeOrigin: true,
          xfwd: true,
        },
        '/': {
          target: 'http://localhost:5173', // Landing page UI
          xfwd: true,
          bypass: (req) => {
            if (req.url && req.url.startsWith('/ohjaaja')) {
              return req.url;
            }
          },
        },
      },
    },
  };
});
