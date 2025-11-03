import { useAppRoutes } from '@/hooks/useAppRoutes';
import { getNavigationTreeItems } from '@/services/navigation-loader';
import { NavigationTreeItem } from '@/types/cms-navigation';
import { LinkComponent, MenuItem } from '@jod/design-system';
import { JodHome } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLoaderData, useLocation } from 'react-router';
import { NavLinkBasedOnAuth } from './NavLinkBasedOnAuth';

const createMenuItem = (
  navigationItem: NavigationTreeItem,
  language: string,
  onClose: () => void,
  pathPrefix: string,
  currentPath: string,
): MenuItem => {
  const path = `${pathPrefix}/${navigationItem.path}`;
  const menuItem = {
    label: navigationItem.title,
    linkComponent: ({ children, className }: LinkComponent) => (
      <NavLink className={className} to={path} onClick={onClose} lang={language}>
        {children}
      </NavLink>
    ),
    selected: currentPath === path,
    childItems: navigationItem.children
      .filter((child) => child.type !== 'Article')
      .map((childItem) => createMenuItem(childItem, language, onClose, path, currentPath)),
  };
  return menuItem;
};

export const useMenuRoutes = (onClose: () => void) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { pathname } = useLocation();
  const navigationTreeItems = getNavigationTreeItems();

  const { profileRoutes } = useAppRoutes();
  const data = useLoaderData();

  const profileIndexPath = t('slugs.profile.index');

  const profileMenuItems: MenuItem[] = profileRoutes.map((route) => ({
    label: route.name,
    linkComponent: ({ children, className }: LinkComponent) => (
      <NavLinkBasedOnAuth
        to={`${profileIndexPath}/${route.path}`}
        shouldLogin={!data}
        className={className}
        onClose={onClose}
      >
        {children}
      </NavLinkBasedOnAuth>
    ),
    selected: pathname === `/${language}/${profileIndexPath}/${route.path}`,
  }));

  const createContentNavigationMenuItems = React.useCallback(() => {
    const topLevelItems = navigationTreeItems.filter((item) => item.lng === language);
    const menuItems: MenuItem[] = topLevelItems.map((item) =>
      createMenuItem(item, language, onClose, `/${language}`, pathname),
    );
    return menuItems;
  }, [language, onClose, pathname, navigationTreeItems]);

  const mainLevelMenuItems: MenuItem[] = React.useMemo(() => {
    return [
      {
        icon: <JodHome />,
        label: t('front-page'),
        linkComponent: ({ children, className }: LinkComponent) => (
          <NavLink to={`/${language}`} className={className} lang={language} onClick={onClose}>
            {children}
          </NavLink>
        ),
        selected: pathname === `/${language}`,
      },
      ...createContentNavigationMenuItems(),

      {
        label: t('advisors-workspace'),
        linkComponent: ({ children, className }: LinkComponent) => (
          <NavLinkBasedOnAuth
            to={`${t('slugs.profile.index')}`}
            shouldLogin={!data}
            className={className}
            onClose={onClose}
          >
            {children}
          </NavLinkBasedOnAuth>
        ),
        childItems: profileMenuItems,
        selected: pathname === `/${language}/${t('slugs.profile.index')}/${t('slugs.profile.front')}`,
      },
    ];
  }, [createContentNavigationMenuItems, t, profileMenuItems, pathname, language, data, onClose]);

  return mainLevelMenuItems;
};
