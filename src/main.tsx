import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { Metric } from 'web-vitals';

import { ServiceVariantProvider } from '@jod/design-system';

import { prefetchOhjaajaContext, releasePrefetchedOhjaajaContext } from './auth';
import { translationsLoaded } from './i18n/config';

import './index.css';
import { getRoutes } from './routes';
import { loadNavigation } from './services/navigation-loader';
import { loadNotifications } from './utils/notifications';

const root = createRoot(document.getElementById('root')!);

if (import.meta.env.DEV) {
  void import('web-vitals').then((vitals) => {
    const warnOnlyNegativeMetrics = (metric: Metric) => {
      if (metric.rating !== 'good') {
        console.warn(`Metric ${metric.name} is not good`, metric);
      }
    };
    vitals.onCLS(warnOnlyNegativeMetrics);
    vitals.onINP(warnOnlyNegativeMetrics);
    vitals.onFCP(warnOnlyNegativeMetrics);
    vitals.onLCP(warnOnlyNegativeMetrics);
    vitals.onTTFB(warnOnlyNegativeMetrics);
  });
  void import('@axe-core/react').then((axe) => {
    void axe.default(React, root, 1000);
  });
}

// Start the startup requests in parallel instead of one after another.
prefetchOhjaajaContext();

Promise.all([
  translationsLoaded,
  loadNavigation(),
  loadNotifications().catch(() => {
    // It's safe to ignore this error.
    // If notification loading fails, the app will continue to work without notifications.
  }),
])
  .then(() => {
    const router = createBrowserRouter(getRoutes(), { basename: '/ohjaaja' });

    // The prefetched session is only valid for the initial navigation, later navigations check the session again.
    const unsubscribe = router.subscribe((state) => {
      if (state.initialized) {
        releasePrefetchedOhjaajaContext();
        unsubscribe();
      }
    });

    root.render(
      <StrictMode>
        <ServiceVariantProvider value="ohjaaja">
          <RouterProvider router={router} />
        </ServiceVariantProvider>
      </StrictMode>,
    );
  })
  .catch((error) => {
    console.error('Failed to start the application', error);
  });
