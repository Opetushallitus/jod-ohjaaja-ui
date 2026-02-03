import i18n, { type Resource } from 'i18next';
import ChainedBackend from 'i18next-chained-backend';
import HttpBackend from 'i18next-http-backend';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';

import commonEn from './common/en.json';
import commonFi from './common/fi.json';
import commonSv from './common/sv.json';
import ohjaajaEn from './ohjaaja/en.json';
import ohjaajaFi from './ohjaaja/fi.json';
import ohjaajaSv from './ohjaaja/sv.json';

export type LangCode = 'fi' | 'sv' | 'en';
export const supportedLanguageCodes: LangCode[] = ['fi', 'sv', 'en'];
export const defaultLang = 'fi';

export const langLabels = {
  en: 'In English',
  fi: 'Suomeksi',
  sv: 'På svenska',
};

const bundledResources: Record<string, Resource> = {
  en: { common: commonEn, ohjaaja: ohjaajaEn },
  fi: { common: commonFi, ohjaaja: ohjaajaFi },
  sv: { common: commonSv, ohjaaja: ohjaajaSv },
};

await i18n
  .use(ChainedBackend)
  .use(initReactI18next)
  .init({
    lng: defaultLang,
    ns: ['ohjaaja', 'common'],
    defaultNS: 'ohjaaja',
    supportedLngs: supportedLanguageCodes,
    fallbackLng: defaultLang,
    preload: supportedLanguageCodes,
    backend: {
      backends: [HttpBackend, resourcesToBackend((lng: string, ns: string) => bundledResources[lng]?.[ns])],
      backendOptions: [
        {
          loadPath: '/ohjaaja/i18n/{{ns}}/{{lng}}.json',
        },
      ],
    },
    interpolation: {
      escapeValue: false,
    },
    returnEmptyString: false,
    saveMissing: false,
  });

export default i18n;
