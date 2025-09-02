import { cx } from '@jod/design-system';
import { JodArrowRight } from '@jod/design-system/icons';
import React from 'react';

type LinkProps = {
  to: string;
  linkComponent: React.ElementType;
  onClick?: never;
};

type ClickProps = {
  to?: never;
  linkComponent?: never;
  onClick: () => void;
};

type StaticProps = {
  to?: never;
  linkComponent?: never;
  onClick?: never;
};

type FeatureCardProps = {
  hero?: boolean;
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  title: string;
  content: string;
  backgroundColor: string;
  collapseOnSmallScreen?: boolean;
  opacity?: number;
  className?: string;
} & (LinkProps | ClickProps | StaticProps);

export const FeatureCard = ({
  level,
  hero = false,
  title,
  content,
  backgroundColor,
  collapseOnSmallScreen = false,
  opacity,
  className,
  to,
  linkComponent,
  onClick,
}: FeatureCardProps) => {
  const headingId = React.useId();
  const contentId = React.useId();

  const Heading = level;
  const Card = linkComponent || 'div';

  return (
    <Card
      to={to}
      onClick={onClick}
      role="region"
      aria-labelledby={headingId}
      aria-describedby={contentId}
      className={cx(`flex flex-col gap-5 rounded-lg px-6 lg:pb-7 ${className ? className : ''}`.trim(), {
        'pt-6 pb-7': hero || !collapseOnSmallScreen,
        'py-[6px] lg:py-6': !hero && collapseOnSmallScreen,
      })}
      style={{ backgroundColor, opacity }}
      data-testid={to ? 'feature-card-link' : 'feature-card'}
    >
      <div className="flex justify-between gap-3 items-center lg:items-start" data-testid="feature-card-header">
        <Heading
          id={headingId}
          className={`${hero ? 'text-heading-1-mobile md:text-heading-1 text-[#000] md:text-nowrap' : 'text-heading-2-mobile md:text-heading-2 text-primary-gray'}`}
          data-testid="feature-card-title"
        >
          {title}
        </Heading>
        {!hero && (
          <div className="size-9 text-primary-gray">
            <JodArrowRight size={48} />
          </div>
        )}
      </div>
      <p
        id={contentId}
        className={cx('text-body-lg-mobile md:text-body-lg whitespace-pre-line', {
          'text-black': hero,
          'text-primary-gray hidden lg:block': collapseOnSmallScreen,
        })}
        data-testid="feature-card-content"
      >
        {content}
      </p>
    </Card>
  );
};
