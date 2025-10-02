import { tidyClasses as tc } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';

type NavigationListItem = {
  id: string;
  path?: string;
  title: string;
  children?: NavigationListItem[];
};

type NavigationListProps = {
  rootItem: NavigationListItem;
  menuTitle?: string;
};

const LinkOrSpan = ({ item }: { item: NavigationListItem }) => {
  const { i18n } = useTranslation();
  return item.path ? (
    <NavLink
      to={item.path}
      lang={i18n.language}
      className={({ isActive }) =>
        tc([
          'hyphens-auto',
          'flex-1',
          'flex',

          'p-3',
          'gap-3',
          'items-center',
          'text-button-md',
          'rounded',
          'cursor-pointer',
          'hover:underline',
          'active:underline',
          'active:text-white',
          'active:bg-secondary-2-dark-2',
          !isActive ? 'hover:bg-bg-gray' : '',
          isActive ? 'bg-secondary-2-dark text-white' : '',
        ])
      }
      end
      data-testid={`navlist-link-${item.id}`}
    >
      {item.title}
    </NavLink>
  ) : (
    <span
      className={'hyphens-auto flex items-center text-[14px] leading-[20px] flex-1 p-3'}
      data-testid={`navlist-text-${item.id}`}
    >
      {item.title}
    </span>
  );
};

export const NavigationList = ({ rootItem, menuTitle }: NavigationListProps) => {
  return (
    <div data-testid={`navigation-list-container`}>
      {menuTitle && <span className="text-body-sm mb-4 mt-2 flex">{menuTitle}</span>}
      <ul className="flex flex-col gap-3" data-testid="navigation-list">
        <li data-testid="navigation-list-root">
          <div className={tc(`flex flex-row space-between min-h-8 gap-2 mb-2`)}>
            <LinkOrSpan item={rootItem} />
          </div>
          <ul className="flex flex-col gap-3 ml-5" data-testid="navigation-list-children">
            {rootItem.children?.map((category) => (
              <li key={category.id} data-testid={`navigation-list-item-${category.id}`}>
                <div className={tc(`flex flex-row space-between min-h-8 gap-2`)}>
                  <LinkOrSpan item={category} />
                </div>
              </li>
            ))}
          </ul>
        </li>
      </ul>
    </div>
  );
};
