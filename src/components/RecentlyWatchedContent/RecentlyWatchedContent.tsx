import { getMostRecentViewedArtikkeliErcs } from '@/api/artikkelinKatselu';
import { LangCode } from '@/i18n/config';
import { getArticlesByErcs } from '@/services/cms-article-api';
import { StructuredContent } from '@/types/cms-content';
import { getIngress, getKeywords, getTitle } from '@/utils/cms';
import { getSearchUrl } from '@/utils/navigation';
import { getArticleCategoryTitlePathParts, getArticlePath } from '@/utils/navigation-paths';
import { ContentCard } from '@jod/design-system';
import React, { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

export const RecentlyWatchedContent = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const [contentCards, setContentCards] = React.useState<JSX.Element[]>([]);

  const createTagsFromKeywords = React.useCallback(
    (keywords: Array<{ name: string; id: number }>) =>
      keywords.map((keyword) => ({
        label: keyword.name,
        to: getSearchUrl(t, language, [`${keyword.id}`]),
      })),
    [t, language],
  );

  const createContentCard = React.useCallback(
    (articleErc: string, articles: StructuredContent[], language: string) => {
      const article = articles.find((a) => a.externalReferenceCode === articleErc);
      if (!article) return null;
      const ingress = getIngress(article);
      const id = `${article.id ?? ''}`;
      const title = getTitle(article);
      const to = getArticlePath(article.id ?? 0, language as LangCode);
      const keywords = getKeywords(article);
      const path = getArticleCategoryTitlePathParts(article.id ?? 0, language as LangCode);
      return (
        <ContentCard
          key={id}
          title={title}
          description={ingress ?? ''}
          to={to}
          linkComponent={Link}
          path={path}
          tags={createTagsFromKeywords(keywords)}
        />
      );
    },
    [createTagsFromKeywords],
  );

  React.useEffect(() => {
    const fetchData = async () => {
      const data = await getMostRecentViewedArtikkeliErcs();
      if (data?.sisalto?.length) {
        // Fetch up to 10 articles to ensure we have enough valid ones
        // We'll display only 4, but fetch more to handle potential missing articles
        const articles = (await getArticlesByErcs(data.sisalto.slice(0, 10)))?.items || [];
        const cards = data.sisalto
          .map((articleErc) => createContentCard(articleErc, articles, language))
          .filter((card): card is JSX.Element => card !== null)
          .slice(0, 4); // Limit to 4 cards

        setContentCards(cards);
      } else {
        setContentCards([]);
      }
    };
    fetchData();
  }, [createContentCard, language]);

  return contentCards.length > 0 ? (
    <>
      <h2 className="col-span-3 text-heading-2-mobile sm:text-heading-2 mb-5" data-testid="recently-watched-title">
        {t('recently-watched-contents')}
      </h2>

      <div className="col-span-3 lg:col-span-2 rounded bg-white p-6" data-testid="recently-watched-list">
        {contentCards.map((card, index) => (
          <React.Fragment key={card.key}>
            {card}
            {/* Add a separator line between cards, except for the last one */}
            {index < contentCards.length - 1 && <hr className="border-border-gray" />}
          </React.Fragment>
        ))}
      </div>
    </>
  ) : (
    <div className="col-span-3 lg:col-span-2" data-testid="recently-watched-empty"></div>
  );
};
