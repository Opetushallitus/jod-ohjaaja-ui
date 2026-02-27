import i18n, { type InitOptions, type Resource } from 'i18next';
import HttpBackend from 'i18next-http-backend';
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
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: defaultLang,
    ns: ['ohjaaja', 'common'],
    defaultNS: 'ohjaaja',
    supportedLngs: supportedLanguageCodes,
    fallbackLng: defaultLang,
    preload: supportedLanguageCodes,
    backend: {
      loadPath: '/ohjaaja/i18n/{{ns}}/{{lng}}.json',
    },
    interpolation: {
      escapeValue: false,
    },
    returnEmptyString: false,
    saveMissing: false,
    maxRetries: 0,
  } as InitOptions);

// Add bundled as fallback
for (const lng of supportedLanguageCodes) {
  for (const ns of ['ohjaaja', 'common']) {
    i18n.addResourceBundle(
      lng,
      ns,
      bundledResources[lng]?.[ns] ?? {},
      true, // deep merge
      false, // do not overwrite HTTP values
    );
  }
}

export default i18n;
