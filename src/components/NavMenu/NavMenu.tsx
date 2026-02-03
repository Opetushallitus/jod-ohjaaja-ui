import { useLocalizedRoutes } from '@/hooks/useLocalizedRoutes';
import { langLabels, supportedLanguageCodes } from '@/i18n/config';
import { ExternalLinkSection, LinkComponent, type MenuSection, NavigationMenu } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useMenuRoutes } from './menuRoutes';

const PortalLink = ({ children, className }: LinkComponent) => {
  const {
    i18n: { language },
  } = useTranslation();

  return (
    <a href={`/${language}`} className={className}>
      {children}
    </a>
  );
};

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
      title: t('common:navigation.external.title'),
      linkItems: [
        {
          label: t('common:navigation.external.yksilo.label'),
          url: `/yksilo/${language}`,
          description: t('common:navigation.external.yksilo.description'),
          accentColor: '#006DB3',
        },
        {
          label: t('common:navigation.external.tietopalvelu.label'),
          url: `/tietopalvelu/${language}`,
          description: t('common:navigation.external.tietopalvelu.description'),
          accentColor: '#AD4298',
        },
      ],
    },
    {
      title: t('common:navigation.extra.title'),
      linkItems: [
        {
          label: t('common:navigation.extra.palveluhakemisto.label'),
          url: t('common:navigation.extra.palveluhakemisto.url'),
        },
      ],
    },
  ];

  const menuSection: MenuSection = {
    title: t('navigation.menu-section-title'),
    linkItems: useMenuRoutes(onClose),
  };

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
      portalLinkComponent={PortalLink}
      portalLinkLabel={t('common:competency-path-portal')}
      menuSection={menuSection}
      ariaCloseMenu={t('common:close-menu')}
      openSubMenuLabel={t('common:open-submenu')}
      onClose={onClose}
      selectedLanguage={language}
      languageSelectionItems={languageSelectionItems}
      externalLinkSections={externalLinkSections}
      languageSelectionTitle={t('common:language-selection')}
      serviceVariant="ohjaaja"
      externalLinkIconAriaLabel={t('common:external-link')}
      data-testid="navigation-menu"
      ariaLabel={t('common:navigation-menu')}
      navigationAriaLabel={t('common:main-navigation')}
    />
  );
};
