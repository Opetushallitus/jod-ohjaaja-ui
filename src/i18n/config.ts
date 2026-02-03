import i18n from 'i18next';
import ChainedBackend from 'i18next-chained-backend';
import HttpBackend from 'i18next-http-backend';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';

export type LangCode = 'fi' | 'sv' | 'en';
export const supportedLanguageCodes: LangCode[] = ['fi', 'sv', 'en'];
export const defaultLang = 'fi';

export const langLabels = {
  en: 'In English',
  fi: 'Suomeksi',
  sv: 'På svenska',
};

i18n
  .use(ChainedBackend)
  .use(initReactI18next)
  .init({
    lng: defaultLang,
    ns: ['ohjaaja', 'common'],
    defaultNS: 'ohjaaja',
    supportedLngs: supportedLanguageCodes,
    fallbackLng: defaultLang,
    backend: {
      backends: [HttpBackend, resourcesToBackend((lng: string, ns: string) => import(`./${ns}/${lng}.json`))],
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
