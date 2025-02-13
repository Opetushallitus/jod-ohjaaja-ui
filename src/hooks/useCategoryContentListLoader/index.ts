import { LangCode } from '@/i18n/config';
import { StructuredContentPage } from '@/types/cms-content';
import { getAcceptLanguageHeader } from '@/utils/cms';
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite';

const fetcher = ([url, language]: [string, LangCode]) =>
  fetch(url, {
    headers: {
      Accept: 'application/json',
      ...getAcceptLanguageHeader(language),
    },
  }).then((res) => res.json());

export const useCategoryContentListLoader = (categoryId: string | undefined, pageSize: number, language: LangCode) => {
  const getKey: SWRInfiniteKeyLoader = (pageIndex, previousPageData: StructuredContentPage) => {
    if (previousPageData && !previousPageData.items.length) return null;
    const queryParams = new URLSearchParams();
    queryParams.set('page', `${pageIndex + 1}`);
    queryParams.set('pageSize', `${pageSize}`);
    if (categoryId) {
      queryParams.set('filter', `taxonomyCategoryIds any (t:t eq ${categoryId})`);
    }
    return [`/ohjaaja/cms/o/headless-delivery/v1.0/sites/20117/structured-contents?${queryParams}`, language];
  };

  const { data, size, setSize, isLoading } = useSWRInfinite<StructuredContentPage>(getKey, fetcher);
  const totalCount = data?.[0]?.totalCount ?? 0;
  const loadMore = () => setSize(size + 1);
  const contents = data?.flatMap((page) => page.items) ?? [];
  const hasMore = contents.length < totalCount;
  return {
    totalCount,
    hasMore,
    contents,
    isLoading,
    loadMore,
  };
};
