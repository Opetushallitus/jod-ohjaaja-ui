import { LinkComponent } from '@jod/design-system';
import React from 'react';
import { Link } from 'react-router';

export interface LinkToOpts {
  useAnchor?: boolean;
  target?: string;
  className?: string;
  rel?: string;
  queryParams?: Record<string, string>;
  state?: Record<string, unknown>;
}
/**
 * A function for creating DS style link components, to avoid creating components during runtime.
 * @param to Same as react-routers Link 'to' prop, can be a string or an object.
 * @param opts Options for the link component
 * @returns A Link component
 */
export const getLinkTo = (
  to: React.ComponentProps<typeof Link>['to'],
  opts: LinkToOpts = { useAnchor: false, target: '_self', rel: 'noreferrer' },
): LinkComponent => {
  const LinkToComponent = ({ children, className = opts.className }: LinkComponent) =>
    opts.useAnchor ? (
      <a className={className} href={typeof to === 'string' ? to : to.pathname} target={opts.target} rel={opts.rel}>
        {children}
      </a>
    ) : (
      <Link className={className} to={to} target={opts.target} rel={opts.rel} state={opts.state}>
        {children}
      </Link>
    );
  return LinkToComponent;
};
