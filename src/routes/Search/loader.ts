import i18n from '@/i18n/config';
import { searchContent } from '@/services/cms-article-api';
import { type StructuredContentPage } from '@/types/cms-content';
import { LoaderFunction } from 'react-router';
import { SEARCH_PAGE_SIZE } from './constants';

const getCurrentLanguage = (langFromUrl?: string) => {
  const fallbackLng = i18n.options.fallbackLng;
  const fallbackLngStr = Array.isArray(fallbackLng) ? fallbackLng[0] : fallbackLng;
  return langFromUrl ?? fallbackLngStr ?? 'fi';
};

const loader = (async ({ request, params }) => {
  const lang = getCurrentLanguage(params.lng);
  const searchParams = new URL(request.url).searchParams;
  const search = searchParams.get('q') ?? '';
  const tagIds = searchParams.getAll('t');
  const page = Number(searchParams.get('p')) || 1;
  const data: StructuredContentPage = await searchContent(search, tagIds, page, SEARCH_PAGE_SIZE, lang);
  return { data, search, tagIds };
}) satisfies LoaderFunction;
export type LoaderData = Awaited<ReturnType<typeof loader>>;
export default loader;
