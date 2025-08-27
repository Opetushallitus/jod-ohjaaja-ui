import { searchContent } from '@/services/cms-article-api';
import { type StructuredContentPage } from '@/types/cms-content';
import { LoaderFunction } from 'react-router';
import { SEARCH_PAGE_SIZE } from './constants';

const loader = (async ({ request }) => {
  const searchParams = new URL(request.url).searchParams;
  const search = searchParams.get('q') ?? '';
  const tagIds = searchParams.getAll('t');
  const page = Number(searchParams.get('p')) || 1;
  const data: StructuredContentPage = await searchContent(search, tagIds, page, SEARCH_PAGE_SIZE);
  return { data, search, tagIds };
}) satisfies LoaderFunction;
export type LoaderData = Awaited<ReturnType<typeof loader>>;
export default loader;
