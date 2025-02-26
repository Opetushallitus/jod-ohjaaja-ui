import { getNewestContent } from '@/services/cms-api';
import { StructuredContentPage } from '@/types/cms-content';
import { LoaderFunction } from 'react-router';

const loader = (async () => {
  const data: StructuredContentPage = await getNewestContent();
  return { data };
}) satisfies LoaderFunction;

export type LoaderData = Awaited<ReturnType<typeof loader>>;
export default loader;
