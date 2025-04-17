import { cx } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, UIMatch, useMatches } from 'react-router';

type BreadcrumbTo =
  | {
      current: true;
      to?: never;
    }
  | {
      current?: false;
      to: string;
    };

export type BreadcrumbLinkProps = {
  children: React.ReactNode;
} & BreadcrumbTo;

export const BreadcrumbLink = ({ to, children, current }: BreadcrumbLinkProps) => {
  return (
    <li>
      {current ? (
        <span className="text-black" aria-current="location">
          {children}
        </span>
      ) : (
        <>
          <NavLink
            to={to}
            className={cx('todo', {
              'text-black': current,
            })}
          >
            {children}
          </NavLink>
          <span className="text-secondary-5 w-[8px] mx-2" aria-hidden={true}>
            /
          </span>
        </>
      )}
    </li>
  );
};

type OhjaajaHandle = {
  title?: string;
  type?: string;
};
const useTypedMatches = () => useMatches() as UIMatch<unknown, OhjaajaHandle>[];

export const Breadcrumb = () => {
  const matches = useTypedMatches();
  const { t } = useTranslation();

  const crumbLinks = React.useCallback(() => {
    const validMatches = matches.filter((m) => m.handle?.title || m.id === 'root');
    const breadcrumbParts = validMatches
      .filter((m) => m.handle?.title || m.id === 'root')
      .map((match: UIMatch<unknown, OhjaajaHandle>, index: number) => {
        const title = match.handle?.title;
        const isLast = index === validMatches.length - 1;
        const isRoot = match.id === 'root';

        if (isLast && !title) {
          return;
        }
        return isLast ? (
          <BreadcrumbLink key={match.id} current>
            {title}
          </BreadcrumbLink>
        ) : (
          <BreadcrumbLink key={match.id} to={match.pathname}>
            {isRoot ? t('front-page') : title}
          </BreadcrumbLink>
        );
      });
    return breadcrumbParts;
  }, [matches, t]);

  return (
    <nav aria-label={t('current-location')} className="text-accent text-body-sm font-bold col-span-3 mb-3">
      <ol className="flex flex-row flex-wrap gap-y-2">{crumbLinks()}</ol>
    </nav>
  );
};
