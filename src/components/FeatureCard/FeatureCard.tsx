import { Button, cx, type LinkComponent } from '@jod/design-system';
import { JodArrowRight } from '@jod/design-system/icons';
import React from 'react';

type LinkProps = {
  linkComponent: LinkComponent;
  buttonText: string;
  onClick?: never;
  hideIcon?: boolean;
};

type ClickProps = {
  linkComponent?: never;
  onClick: () => void;
  buttonText: string;
  hideIcon?: boolean;
};

type StaticProps = {
  linkComponent?: never;
  onClick?: never;
  buttonText?: never;
  hideIcon?: never;
};

type FeatureCardProps = {
  hero?: boolean;
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  title: string;
  content: string;
  backgroundColor: string;
  collapseOnSmallScreen?: boolean;
  className?: string;
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
  onClick,
  hideIcon = false,
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
      <div className="flex justify-between gap-3 items-center lg:items-start" data-testid="feature-card-header">
        <Heading
          id={headingId}
          className={`${hero ? 'text-heading-1-mobile md:text-heading-1 text-white whitespace-pre-line' : 'text-heading-2-mobile md:text-heading-2 text-white'}`}
          data-testid="feature-card-title"
        >
          {title}
        </Heading>
      </div>
      <p
        id={contentId}
        className={'text-body-lg-mobile md:text-body-lg whitespace-pre-line text-white flex-grow'}
        data-testid="feature-card-content"
      >
        {content}
      </p>
      {linkComponent && buttonText ? (
        <Button
          label={buttonText}
          LinkComponent={linkComponent}
          variant="white"
          serviceVariant="ohjaaja"
          icon={hideIcon ? undefined : <JodArrowRight aria-hidden />}
          iconSide="right"
          data-testid="feature-card-button-link"
        />
      ) : null}
      {onClick ? (
        <Button
          onClick={onClick}
          label={buttonText}
          variant="white"
          serviceVariant="ohjaaja"
          icon={hideIcon ? undefined : <JodArrowRight aria-hidden />}
          iconSide="right"
          aria-labelledby={`${headingId} ${contentId}`}
          data-testid="feature-card-button"
          className="self-start"
        />
      ) : null}
    </div>
  );
};
