import i18n, { LangCode } from '@/i18n/config';
import { getAcceptLanguageHeader } from '@/utils/cms';

const BASE_CMS_URL = '/ohjaaja/cms/o';
export const SCOPE_ID = '20117'; // This is the ID of the site in Liferay

export const fetchFromCMS = async <T>(endpoint: string): Promise<T> => {
  const response = await fetch(`${BASE_CMS_URL}${endpoint}`, {
    headers: {
      Accept: 'application/json',
      ...getAcceptLanguageHeader(i18n.language as LangCode),
    },
  });

  if (!response.ok) {
    throw new Error(`CMS API error: ${response.statusText}`);
  }

  return response.json();
};
