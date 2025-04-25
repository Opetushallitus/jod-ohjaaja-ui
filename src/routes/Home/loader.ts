import { components } from '@/api/schema';
import { getNewestContent } from '@/services/cms-api';
import { StructuredContentPage } from '@/types/cms-content';

import { LoaderFunction } from 'react-router';

const loader = (async ({ context }) => {
  const data: StructuredContentPage = await getNewestContent();
  return { data, isLoggedIn: !!context };
}) satisfies LoaderFunction<components['schemas']['OhjaajaCsrfDto'] | null>;

export type LoaderData = Awaited<ReturnType<typeof loader>>;
export default loader;
