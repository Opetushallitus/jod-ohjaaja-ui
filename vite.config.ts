import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { imagetools, type Picture as ImagetoolsPicture } from 'vite-imagetools';

import type { PictureData } from '@jod/design-system';

// Build-time image optimization presets, used as `import hero from './hero.jpg?preset=hero'`.
// Query parameters override the preset, e.g. `?preset=hero&w=720;1440`.
const imagePresets: Record<string, Record<string, string>> = {
  // Full-width hero, always rendered at 1440px, so only the format varies.
  hero: { format: 'avif;webp;jpg', as: 'picture' },
  // CSS backgrounds: a single width, converted to `image-set()` with `pictureToImageSet`.
  bg: { format: 'avif;webp;jpg', w: '1440', as: 'picture' },
};

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
      imagetools({
        defaultDirectives: (url) => new URLSearchParams(imagePresets[url.searchParams.get('preset') ?? ''] ?? {}),
        // Emit `as=picture` in the shape of the design system's `PictureData`,
        // so imports can be passed straight to `<Picture picture={...} />`.
        extendOutputFormats: (builtins) => ({
          ...builtins,
          picture: (args) => async (metadatas) => {
            const { sources, img } = (await builtins.picture(args)(metadatas)) as ImagetoolsPicture;
            return {
              sources: Object.entries(sources).map(([format, srcSet]) => ({ srcSet, type: `image/${format}` })),
              img,
            } satisfies PictureData;
          },
        }),
      }),
      {
        name: 'serve-notifications-json',
        configureServer(server) {
          server.middlewares.use('/ohjaaja/config/notifications.json', (_, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify([
                // {
                //   id: 'test-notification',
                //   title: { fi: 'Testi-ilmoitus', sv: 'Testnotis', en: 'Test notification' },
                //   description: {
                //     fi: 'Tämä on testi-ilmoitus.',
                //     sv: 'Detta är en testnotis.',
                //     en: 'This is a test notification.',
                //   },
                //   variant: 'success' as const,
                //   link: {
                //     label: { fi: 'Lue lisää', sv: 'Läs mer', en: 'Read more' },
                //     url: {
                //       fi: 'http://localhost:8080/ohjaaja/fi',
                //       sv: 'http://localhost:8080/ohjaaja/sv',
                //       en: 'http://localhost:8080/ohjaaja/en',
                //     },
                //   },
                // },
              ]),
            );
          });
        },
      },
    ],
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              // React must sit in its own chunk: it changes rarely and everything depends on it.
              {
                name: 'react-vendor',
                test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
                priority: 40,
              },
              // The shared UI machinery pulled in by the design system.
              {
                name: 'ui-vendor',
                test: /[\\/]node_modules[\\/](@headlessui|@ark-ui|@floating-ui|@zag-js|@react-aria|@tanstack|@internationalized|motion|framer-motion|focus-trap|focus-trap-react|tabbable)[\\/]/,
                priority: 30,
              },
              // The design system itself. Matches both the installed package and a
              // `npm link`ed checkout, whose module ids are real paths.
              {
                name: 'design-system',
                test: /(?:[\\/]node_modules[\\/]@jod[\\/]design-system[\\/]|[\\/]jod-design-system[\\/]dist[\\/])/,
                priority: 20,
              },
              {
                name: 'vendor',
                test: /[\\/]node_modules[\\/]/,
                priority: 10,
                minSize: 20_000,
              },
            ],
          },
        },
      },
    },
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
      // Keeps the dev server working against a `npm link`ed @jod/design-system:
      // without this it loads a second React from the linked checkout's own
      // node_modules and every hook call throws. Does not help Vitest, which
      // resolves externalized deps with Node — run tests against `npm pack`
      // output instead (see README).
      dedupe: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'motion',
        '@headlessui/react',
        '@ark-ui/react',
        '@floating-ui/react',
        '@internationalized/date',
        'cva',
        'tailwind-merge',
        'focus-trap-react',
      ],
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
