import { JodOpenInNew } from '@jod/design-system/icons';
import { useTranslation } from 'react-i18next';

interface ExternalLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children?: React.ReactNode;
  className?: string;
}

export const ExternalLink = ({ href, children, className = '', ...rest }: ExternalLinkProps) => {
  const { t } = useTranslation();
  return (
    <a
      href={href}
      className={`inline-flex text-accent ${className}`}
      target="_blank"
      rel="noopener noreferrer"
      {...rest}
    >
      {children}
      <JodOpenInNew size={24} ariaLabel={t('external-link')} />
    </a>
  );
};
