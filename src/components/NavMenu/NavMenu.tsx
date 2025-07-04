import { useLocalizedRoutes } from '@/hooks/useLocalizedRoutes';
import { langLabels, supportedLanguageCodes } from '@/i18n/config';
import { ExternalLinkSection, LinkComponent, NavigationMenu } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useMenuRoutes } from './menuRoutes';

const FrontPageLink = ({ children, className }: LinkComponent) => {
  // Navigate to the landing page
  return (
    <a href="/" className={className}>
      {children}
    </a>
  );
};

const LogoLink = ({
  to,
  className,
  children,
}: {
  to: object | string;
  className?: string;
  children: React.ReactNode;
}) => (
  <Link to={to} className={className}>
    {children}
  </Link>
);

const LanguageSelectionLinkComponent = (generateLocalizedPath: (langCode: string) => string, langCode: string) => {
  const LanguageSelectionLink = (props: LinkComponent) => {
    const localizedPath = generateLocalizedPath(langCode);
    return <Link to={localizedPath} {...props} />;
  };
  return LanguageSelectionLink;
};

export const NavMenu = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { generateLocalizedPath } = useLocalizedRoutes();

  const externalLinkSections: ExternalLinkSection[] = [
    {
      title: t('navigation.external.title'),
      linkItems: [
        {
          label: t('navigation.external.yksilo.label'),
          url: t('navigation.external.yksilo.url'),
          description: t('navigation.external.yksilo.description'),
          accentColor: '#85C4EC',
        },
        {
          label: t('navigation.external.tietopalvelu.label'),
          url: t('navigation.external.tietopalvelu.url'),
          description: t('navigation.external.tietopalvelu.description'),
          accentColor: '#EBB8E1',
        },
      ],
    },
  ];

  const menuItems = useMenuRoutes(onClose);

  const getLanguageSelectionItems = React.useCallback(() => {
    return supportedLanguageCodes.map((code) => ({
      label: langLabels[code] ?? code,
      value: code,
      linkComponent: LanguageSelectionLinkComponent(generateLocalizedPath, code),
    }));
  }, [generateLocalizedPath]);

  const languageSelectionItems = getLanguageSelectionItems();

  return (
    <NavigationMenu
      open={open}
      accentColor="#66CBD1"
      FrontPageLinkComponent={FrontPageLink}
      backLabel={t('back')}
      menuItems={menuItems}
      ariaCloseMenu={t('close-menu')}
      openSubMenuLabel={t('open-submenu')}
      frontPageLinkLabel={t('front-page')}
      onClose={onClose}
      logo={{ to: `/${language}`, language, srText: t('osaamispolku') }}
      logoLink={LogoLink}
      selectedLanguage={language}
      languageSelectionItems={languageSelectionItems}
      externalLinkSections={externalLinkSections}
    />
  );
};
