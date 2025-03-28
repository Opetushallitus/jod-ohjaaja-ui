import { useCategoryRoute } from '@/hooks/useCategoryRoutes';
import { Accordion, cx, useMediaQueries } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';

export const CategoryNavigation = () => {
  const categoryRoute = useCategoryRoute();
  const { i18n } = useTranslation();

  const hasChildren = categoryRoute?.children?.some((category) => category.handle?.type.startsWith('Category'));
  const rootPath = `/${i18n.language}/${categoryRoute?.path ?? ''}`;

  return (
    categoryRoute &&
    hasChildren && (
      <div className="bg-secondary-2-25 rounded-md py-3 lg:py-6 px-[20px]">
        <Navigation>
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
        </Navigation>
      </div>
    )
  );
};

interface NavigationProps {
  children: React.ReactNode;
}

const Navigation = ({ children }: NavigationProps) => {
  const { lg } = useMediaQueries();
  const { i18n, t } = useTranslation();

  return lg ? (
    children
  ) : (
    <Accordion title={t('contents')} lang={i18n.language} initialState={false}>
      {children}
    </Accordion>
  );
};
