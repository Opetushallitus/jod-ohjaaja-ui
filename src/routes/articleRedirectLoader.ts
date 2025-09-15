import i18n from '@/i18n/config';
import { getNavigationTreeItems } from '@/services/navigation-loader';
import { NavigationTreeItem } from '@/types/cms-navigation';
import { LoaderFunction, replace } from 'react-router';

export default (async ({ params: { articleErc } }) => {
  const navigationTreeItems = getNavigationTreeItems();
  const articlePath = findArticlePath(navigationTreeItems, articleErc);
  return articlePath
    ? replace(encodeURI(`/${i18n.language}/${articlePath}${window.location.hash}`))
    : replace(`/${i18n.language}`);
}) satisfies LoaderFunction;

const findArticlePath = (
  navigationItems: readonly NavigationTreeItem[],
  articleErc: string | undefined,
): string | null => {
  for (const item of navigationItems) {
    if (item.type === 'Article' && item.externalReferenceCode === articleErc) {
      return item.path;
    }
    if (item.children) {
      const childPath = findArticlePath(item.children, articleErc);
      if (childPath) {
        return `${item.path}/${childPath}`;
      }
    }
  }
  return null;
};
