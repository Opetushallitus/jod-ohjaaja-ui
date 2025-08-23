import { cx } from '@jod/design-system';
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
};

const LinkOrSpan = ({ item, level }: { item: NavigationListItem; level: 1 | 2 }) => {
  const { i18n } = useTranslation();
  return item.path ? (
    <NavLink
      to={item.path}
      lang={i18n.language}
      className={({ isActive }) =>
        cx(
          `hyphens-auto text-black w-full block py-3 text-button-md hover:underline ${level === 2 ? 'pl-7' : 'pl-5'}`,
          {
            'bg-secondary-2-50 rounded-md': isActive,
          },
        )
      }
      end
      data-testid={`navlist-link-${level}`}
    >
      {item.title}
    </NavLink>
  ) : (
    <span
      className={`hyphens-auto text-black w-full block py-3 text-button-md ${level === 2 ? 'pl-7' : 'pl-5'}`}
      data-testid={`navlist-text-${level}`}
    >
      {item.title}
    </span>
  );
};

export const NavigationList = ({ rootItem }: NavigationListProps) => {
  return (
    <ul className="flex flex-col gap-y-2 py-3" data-testid="navigation-list">
      <li className="flex min-h-7 items-center w-full" data-testid="navigation-list-root">
        <LinkOrSpan item={rootItem} level={1} />
      </li>
      {rootItem.children?.map((category) => (
        <li
          key={category.id}
          className="flex min-h-7 items-center w-full"
          data-testid={`navigation-list-item-${category.id}`}
        >
          <LinkOrSpan item={category} level={2} />
        </li>
      ))}
    </ul>
  );
};
