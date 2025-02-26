import { getCategoryContent } from '@/services/cms-api';
import { StructuredContentPage } from '@/types/cms-content';
import { LoaderFunction } from 'react-router';

const getCategoryContentLoader = (categoryId: number) =>
  (async () => {
    const data: StructuredContentPage = await getCategoryContent(categoryId);

    return { data };
  }) satisfies LoaderFunction;

export type LoaderData = Awaited<ReturnType<ReturnType<typeof getCategoryContentLoader>>>;
export default getCategoryContentLoader;
