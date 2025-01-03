import { LangCode } from '@/i18n/config';
import { StructuredContent } from '@/types/cms-content';

type ContentLabel = 'Tiivistelmä' | 'Kuvaus' | 'Kuva' | 'Tiedosto' | 'Linkki';

/**
 * Finds the content value from Liferay strucured content by label
 * @param item Structured content item
 * @param {ContentLabel} label Content label
 * @returns {ContentFieldValue | undefined} Content value
 */
export const findContentValueByLabel = (item: StructuredContent, label: ContentLabel) => {
  return item.contentFields?.find((field) => field.label === label)?.contentFieldValue;
};

/**
 * Get the Accept-Language header based on the language code
 * @param {LangCode} language Language code
 * @returns {Record<string, string>} Accept-Language header
 */
export const getAcceptLanguageHeader = (language: LangCode) => {
  let resourceLangCode = 'fi-FI';

  if (language === 'en') {
    resourceLangCode = 'en-US';
  } else if (language === 'sv') {
    resourceLangCode = 'sv-SE';
  }

  return { 'Accept-Language': resourceLangCode };
};
