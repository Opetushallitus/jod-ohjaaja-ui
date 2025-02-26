import { getContentByArticleKey } from '@/services/cms-api';
import { StructuredContent } from '@/types/cms-content';
import { LoaderFunction } from 'react-router';

const getContentDetailsLoader = (contentId: number) =>
  (async () => {
    const data: StructuredContent = await getContentByArticleKey(contentId);
    return { data };
  }) satisfies LoaderFunction;

export type LoaderData = Awaited<ReturnType<ReturnType<typeof getContentDetailsLoader>>>;
export default getContentDetailsLoader;
