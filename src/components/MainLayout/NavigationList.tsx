import { cx } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { NavLink, type RouteObject } from 'react-router';
type NavigationListProps = {
  categoryRoute: RouteObject;
};

export const NavigationList = ({ categoryRoute }: NavigationListProps) => {
  const { i18n } = useTranslation();
  const rootPath = `/${i18n.language}/${categoryRoute.path ?? ''}`;

  return (
    <ul className="flex flex-col gap-y-2 py-3">
      <li className="flex min-h-7 items-center w-full">
        <NavLink
          to={rootPath}
          lang={i18n.language}
          className={({ isActive }) =>
            cx('hyphens-auto text-black w-full block py-3 text-button-md hover:underline pl-5', {
              'bg-secondary-2-50 rounded-md': isActive,
            })
          }
          end
        >
          {categoryRoute.handle.title}
        </NavLink>
      </li>
      {categoryRoute.children?.map(
        (category) =>
          category.handle?.type.startsWith('Category') && (
            <li key={category.id} className="flex min-h-7 items-center w-full">
              <NavLink
                to={`${rootPath}/${category.path ?? ''}`}
                lang={i18n.language}
                className={({ isActive }) =>
                  cx('hyphens-auto text-black w-full block py-3 text-button-md hover:underline pl-7', {
                    'bg-secondary-2-50 rounded-md': isActive,
                  })
                }
                end
              >
                {category.handle.title}
              </NavLink>
            </li>
          ),
      )}
    </ul>
  );
};
