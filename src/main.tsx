import { ServiceVariantProvider } from '@jod/design-system';
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { Metric } from 'web-vitals';
import './i18n/config';
import './index.css';
import { getRoutes } from './routes';
import { loadNavigation } from './services/navigation-loader';

const root = createRoot(document.getElementById('root')!);

if (process.env.NODE_ENV !== 'production') {
  import('web-vitals').then((vitals) => {
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
  import('@axe-core/react').then((axe) => {
    axe.default(React, root, 1000);
  });
}

loadNavigation()
  .then(() => {
    const router = createBrowserRouter(getRoutes(), { basename: '/ohjaaja' });

    root.render(
      <StrictMode>
        <ServiceVariantProvider value="ohjaaja">
          <RouterProvider router={router} />
        </ServiceVariantProvider>
      </StrictMode>,
    );
  })
  .catch((error) => {
    console.error('Failed to load navigation', error);
  });
