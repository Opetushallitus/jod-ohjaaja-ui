import i18n, { type LangCode } from '@/i18n/config';
import { StructuredContentPage } from '@/types/cms-content';
import { getAcceptLanguageHeader } from '@/utils/cms';
import { LoaderFunction } from 'react-router';

const loader = (async () => {
  const queryParams = new URLSearchParams();
  queryParams.set('sort', 'dateCreated:desc');
  const response = await fetch(`/cms/o/headless-delivery/v1.0/sites/20117/structured-contents?${queryParams}`, {
    headers: {
      Accept: 'application/json',
      ...getAcceptLanguageHeader(i18n.language as LangCode),
    },
  });
  const data: StructuredContentPage = await response.json();

  return { data };
}) satisfies LoaderFunction;

export type LoaderData = Awaited<ReturnType<typeof loader>>;
export default loader;
