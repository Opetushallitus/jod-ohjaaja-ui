import React from 'react';

import { Button, cx, type LinkComponent } from '@jod/design-system';
import { JodArrowRight } from '@jod/design-system/icons';

type LinkProps = {
  linkComponent: LinkComponent;
  buttonText: string;
  buttonOpensModal?: never;
  onClick?: never;
  hideIcon?: boolean;
  icon?: React.ReactNode;
};

type ClickProps = {
  linkComponent?: never;
  onClick: () => void;
  buttonText: string;
  buttonOpensModal?: boolean;
  hideIcon?: boolean;
  icon?: React.ReactNode;
};

type StaticProps = {
  linkComponent?: never;
  onClick?: never;
  buttonText?: never;
  buttonOpensModal?: never;
  hideIcon?: never;
  icon?: never;
};

type FeatureCardProps = {
  hero?: boolean;
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  title: string;
  content: string;
  backgroundColor: string;
  collapseOnSmallScreen?: boolean;
  className?: string;
  icon?: React.ReactNode;
} & (LinkProps | ClickProps | StaticProps);

export const FeatureCard = ({
  level,
  hero = false,
  title,
  content,
  backgroundColor,
  collapseOnSmallScreen = false,
  className,
  linkComponent,
  buttonText,
  buttonOpensModal,
  onClick,
  hideIcon = false,
  icon = <JodArrowRight aria-hidden />,
}: FeatureCardProps) => {
  const headingId = React.useId();
  const contentId = React.useId();

  const Heading = level;

  return (
    <div
      className={cx(`flex flex-col gap-5 rounded-lg px-6 lg:pb-7 ${className || ''}`.trim(), {
        'pt-6 pb-7': hero || !collapseOnSmallScreen,
        'py-[6px] lg:py-6': !hero && collapseOnSmallScreen,
      })}
      style={{ backgroundColor }}
      data-testid={'feature-card'}
    >
      <div className="flex items-center justify-between gap-3 lg:items-start" data-testid="feature-card-header">
        <Heading
          id={headingId}
          className={`${hero ? 'text-heading-1-mobile whitespace-pre-line text-white md:text-heading-1' : 'text-heading-2-mobile text-white md:text-heading-2'}`}
          data-testid="feature-card-title"
        >
          {title}
        </Heading>
      </div>
      <p
        id={contentId}
        className="flex-grow text-body-lg-mobile whitespace-pre-line text-white md:text-body-lg"
        data-testid="feature-card-content"
      >
        {content}
      </p>
      {linkComponent && buttonText ? (
        <Button
          label={buttonText}
          linkComponent={linkComponent}
          variant="white"
          serviceVariant="ohjaaja"
          icon={hideIcon ? undefined : icon}
          iconSide="right"
          className="w-fit"
          data-testid="feature-card-button-link"
        />
      ) : null}
      {onClick ? (
        <Button
          onClick={onClick}
          label={buttonText}
          variant="white"
          serviceVariant="ohjaaja"
          icon={hideIcon ? undefined : icon}
          iconSide="right"
          aria-labelledby={`${headingId} ${contentId}`}
          className="w-fit"
          data-testid="feature-card-button"
          ariaHaspopup={buttonOpensModal ? 'dialog' : undefined}
        />
      ) : null}
    </div>
  );
};
