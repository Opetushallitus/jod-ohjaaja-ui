import { LangCode } from '@/i18n/config';
import { isNavigationItemType } from '@/types/cms-navigation';
import { getItemPath } from '@/utils/navigation-paths';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, useMatches, useParams, useSearchParams } from 'react-router';

export const useLocalizedRoutes = () => {
  const matches = useMatches();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

  // Generate localized path in given language
  const generateLocalizedPath = React.useCallback(
    (lng: string) => {
      const pathnameParts: string[] = [];
      for (const match of matches) {
        const { id } = match;
        if (id === 'root') {
          // Add language to root
          pathnameParts.push(lng);
        } else if (id.includes('|')) {
          const pathParts = id.split('|');
          if (pathParts.length <= 2) {
            // Split id to get path
            const path = pathParts[0];
            // Replace path parameters with translations
            const localizedPath = path.replace(/{([^{}]*)}/g, (_m, translationKey: string) => {
              return t(translationKey, { lng });
            });
            pathnameParts.push(localizedPath);
          } else {
            const type = pathParts[0];
            const name = pathParts[1];
            if (isNavigationItemType(type)) {
              pathnameParts.push(getItemPath(lng as LangCode, type, name));
            }
          }
        }
      }

      const path = generatePath(`/${pathnameParts.join('/')}`, params);

      // Append current query parameters if any exist
      const queryString = searchParams.toString();
      if (queryString) {
        return `${path}?${queryString}`;
      }

      return path;
    },
    [matches, params, searchParams, t],
  );

  return { generateLocalizedPath };
};
