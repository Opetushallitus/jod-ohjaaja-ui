import { useTranslation } from 'react-i18next';
import { useMatches, type UIMatch } from 'react-router';

type OhjaajaHandle = {
  title?: string;
  type?: string;
};

export const useBreadcrumbItems = () => {
  const matches = useMatches() as UIMatch<unknown, OhjaajaHandle>[];
  const { t } = useTranslation();

  const validMatches = matches.filter((m) => m.handle?.title || m.id === 'root');
  return validMatches
    .filter((m) => m.handle?.title || m.id === 'root')
    .map((match: UIMatch<unknown, OhjaajaHandle>, index: number) => {
      const title = match.handle?.title;
      const isLast = index === validMatches.length - 1;
      const isRoot = match.id === 'root';

      if (isLast && !title) {
        return;
      }
      return {
        label: isRoot ? t('front-page') : title,
        to: !isLast ? match.pathname : undefined,
      };
    })
    .filter((item) => item !== undefined) as { label: string; to: string | undefined }[];
};
