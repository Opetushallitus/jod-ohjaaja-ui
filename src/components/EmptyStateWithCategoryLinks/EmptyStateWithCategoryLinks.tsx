import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { EmptyState } from '@jod/design-system';
import { JodArrowRight } from '@jod/design-system/icons';

import { getMainCategory, getMainCategoryPath } from '@/utils/navigation-paths';

interface EmptyStateWithCategoryLinksProps {
  /** Text shown in the EmptyState component */
  emptyStateText: string;
  /** Prefix for data-testid attributes, defaults to "empty-state" */
  testIdPrefix?: string;
}

export const EmptyStateWithCategoryLinks = ({
  emptyStateText,
  testIdPrefix = 'empty-state',
}: EmptyStateWithCategoryLinksProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  return (
    <div className="flex flex-col gap-11">
      <div className="w-fit">
        <EmptyState text={emptyStateText} />
      </div>
      <div className="mt-11 flex flex-col gap-3 border-t-2 border-t-border-gray py-7">
        <p className="font-bold mb-3 font-arial text-body-md">{t('category-links.title')}</p>
        <Link
          to={`/${language}/${getMainCategoryPath(language, 0)}`}
          className="flex items-center gap-2 p-2 text-button-sm text-secondary-2-dark"
          data-testid={`${testIdPrefix}-link-category-0`}
        >
          {getMainCategory(language, 0)?.title ?? ''} <JodArrowRight size={20} />
        </Link>

        <Link
          to={`/${language}/${getMainCategoryPath(language, 1)}`}
          className="flex items-center gap-2 p-2 text-button-sm text-secondary-2-dark"
          data-testid={`${testIdPrefix}-link-category-1`}
        >
          {getMainCategory(language, 1)?.title ?? ''} <JodArrowRight size={20} />
        </Link>

        <Link
          to={`/${language}/${getMainCategoryPath(language, 2)}`}
          className="flex items-center gap-2 p-2 text-button-sm text-secondary-2-dark"
          data-testid={`${testIdPrefix}-link-category-2`}
        >
          {getMainCategory(language, 2)?.title ?? ''} <JodArrowRight size={20} />
        </Link>
      </div>
    </div>
  );
};
