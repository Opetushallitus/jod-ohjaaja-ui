import { LangCode } from '@/i18n/config';
import { StructuredContent } from '@/types/cms-content';
import { findContentValueByName, getAdaptiveMediaSrc, getKeywords } from '@/utils/cms';
import { getSearchUrl } from '@/utils/navigation';
import { getArticlePath } from '@/utils/navigation-paths';
import { Button, MediaCard, Spinner } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

interface ContentListProps {
  contents: StructuredContent[];
  totalCount: number;
  hasMore: boolean;
  isLoading: boolean;
  loadMore: () => void;
}

export const ContentList = ({ contents, totalCount, hasMore, isLoading, loadMore }: ContentListProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  return (
    <div>
      <div className="mb-3 sm:mb-5 text-heading-2-mobile sm:text-heading-2">
        {t('content-list.article-count', { count: totalCount })}
      </div>
      <div className="flex flex-col flex-wrap gap-3 sm:gap-5">
        {contents.map((content) => {
          const imageContent = findContentValueByName(content, 'image')?.image;
          const ingress = findContentValueByName(content, 'ingress')?.data;
          const id = `${content.id ?? ''}`;
          const imageSrc = getAdaptiveMediaSrc(imageContent?.id, imageContent?.title, 'thumbnail');
          const path = getArticlePath(content.id ?? 0, language as LangCode);
          const keywords = getKeywords(content);

          return (
            <MediaCard
              key={id}
              variant="horizontal"
              label={content.title ?? ''}
              description={ingress ?? ''}
              imageSrc={imageSrc}
              imageAlt={imageContent?.title ?? ''}
              to={path}
              linkComponent={Link}
              tags={keywords.map((keyword) => ({ label: keyword.name, to: getSearchUrl(t, language, [keyword.id]) }))}
            />
          );
        })}
      </div>
      <div className="flex flex-row pt-4 justify-center">
        {hasMore && !isLoading && <Button onClick={loadMore} label={t('content-list.show-more')} variant="white" />}
        {isLoading && <Spinner color="white" size={24} />}
      </div>
    </div>
  );
};
