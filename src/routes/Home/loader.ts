import { StructuredContentPage } from '@/types/cms-content';
import { LoaderFunction } from 'react-router';

const loader = (async () => {
  const queryParams = new URLSearchParams();
  queryParams.set('sort', 'dateCreated:desc');
  const response = await fetch(`cms/o/headless-delivery/v1.0/sites/20117/structured-contents?${queryParams}`, {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'fi-FI',
    },
  });
  const data: StructuredContentPage = await response.json();

  return { data };
}) satisfies LoaderFunction;

export type LoaderData = Awaited<ReturnType<typeof loader>>;
export default loader;
