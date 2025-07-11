import { type LangCode } from '@/i18n/config';
import { type StructuredContent } from '@/types/cms-content';
import { findContentValueByName, getKeywords } from '@/utils/cms';
import { getSearchUrl } from '@/utils/navigation';
import { getArticleCategoryTitlePathParts, getArticlePath } from '@/utils/navigation-paths';
import { ContentCard, type PageChangeDetails, Pagination } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

interface SearchResultsProps {
  contents: StructuredContent[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  loadPage: (page: number) => void;
  filterMenu?: React.ReactNode;
}

export const SearchResults = ({
  contents,
  totalCount,
  pageSize,
  currentPage,
  loadPage,
  filterMenu,
}: SearchResultsProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const handleOnPageChange = (details: PageChangeDetails) => {
    loadPage(details.page);
  };

  const pageCount = Math.ceil(totalCount / pageSize);

  return (
    <div>
      <div className="mb-2 flex flex-row items-center justify-between">
        <p className="text-body-md">{t('search-results.article-count', { count: totalCount })}</p>
        {filterMenu}
      </div>
      <div className="flex flex-col flex-wrap gap-3 sm:gap-3">
        {contents.map((content, index) => {
          const ingress = findContentValueByName(content, 'ingress')?.data;
          const id = `${content.id ?? ''}`;
          const to = getArticlePath(content.id ?? 0, language as LangCode);
          const path = getArticleCategoryTitlePathParts(content.id ?? 0, language as LangCode);
          const keywords = getKeywords(content);
          const isLastItem = index === contents.length - 1;

          return (
            <React.Fragment key={id}>
              <ContentCard
                title={content.title ?? ''}
                description={ingress ?? ''}
                path={path}
                to={to}
                linkComponent={Link}
                tags={keywords.map((keyword) => ({
                  label: keyword.name,
                  to: getSearchUrl(t, language, [`${keyword.id}`]),
                }))}
              />
              {!isLastItem && <div className="border-b border-border-gray" />}
            </React.Fragment>
          );
        })}
      </div>
      {contents.length > 0 && pageCount > 1 && (
        <div className="pt-4">
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={totalCount}
            siblingCount={5}
            onPageChange={handleOnPageChange}
            serviceVariant="ohjaaja"
            translations={{
              nextTriggerLabel: t('pagination.next'),
              prevTriggerLabel: t('pagination.previous'),
              itemLabel: ({ page }) => t('pagination.page', { page }),
            }}
          />
        </div>
      )}
    </div>
  );
};
