import i18n, { type LangCode } from '@/i18n/config';
import { StructuredContent } from '@/types/cms-content';
import { getAcceptLanguageHeader } from '@/utils/cms';
import { LoaderFunction } from 'react-router';

const loader = (async ({ params }) => {
  if (!params.id) {
    throw new Response('Bad request', { status: 400 });
  }

  const response = await fetch(`/cms/o/headless-delivery/v1.0/structured-contents/${params.id}`, {
    headers: {
      Accept: 'application/json',
      ...getAcceptLanguageHeader(i18n.language as LangCode),
    },
  });
  const data: StructuredContent = await response.json();

  return { data };
}) satisfies LoaderFunction;

export type LoaderData = Awaited<ReturnType<typeof loader>>;
export default loader;
