import { cx } from '@jod/design-system';
import React from 'react';
import { MdArrowForward } from 'react-icons/md';

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
}: {
  hero?: boolean;
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  title: string;
  content: string;
  backgroundColor: string;
  collapseOnSmallScreen?: boolean;
  opacity?: number;
  className?: string;
  to?: string;
  linkComponent?: React.ElementType;
}) => {
  const headingId = React.useId();
  const contentId = React.useId();

  const Heading = level;
  const Card = linkComponent || 'div';

  return (
    <Card
      to={to}
      role="region"
      aria-labelledby={headingId}
      aria-describedby={contentId}
      className={cx(`flex flex-col gap-5 rounded-lg px-6 lg:pb-7 ${className ? className : ''}`.trim(), {
        'pt-6 pb-7': hero || !collapseOnSmallScreen,
        'py-[6px] lg:py-6': !hero && collapseOnSmallScreen,
      })}
      style={{ backgroundColor, opacity }}
    >
      <div className="flex justify-between gap-3 items-center lg:items-start">
        <Heading
          id={headingId}
          className={`${hero ? 'text-heading-1-mobile md:text-heading-1 text-[#000] md:text-nowrap' : 'text-heading-2-mobile md:text-heading-2 text-[#333]'}`}
        >
          {title}
        </Heading>
        {!hero && (
          <div className="size-9 text-[#333]">
            <MdArrowForward size={48} />
          </div>
        )}
      </div>
      <p
        id={contentId}
        className={cx('text-body-lg-mobile md:text-body-lg whitespace-pre-line', {
          'text-black': hero,
          'text-[#333] hidden lg:block': collapseOnSmallScreen,
        })}
      >
        {content}
      </p>
    </Card>
  );
};
