import i18n, { LangCode } from '@/i18n/config';
import { StructuredContent, StructuredContentPage } from '@/types/cms-content';
import { type CMSNavigationMenu } from '@/types/cms-navigation';
import { getAcceptLanguageHeader } from '@/utils/cms';

const BASE_CMS_URL = '/ohjaaja/cms/o';
const SCOPE_ID = '20117'; // This is the ID of the site in Liferay

const fetchFromCMS = async <T>(endpoint: string): Promise<T> => {
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

export const getNavigations = async () => {
  return fetchFromCMS<CMSNavigationMenu>(`/jod-navigation/${SCOPE_ID}`);
};

export const getContentByArticleId = async (articleId: number) => {
  return fetchFromCMS<StructuredContent>(`/headless-delivery/v1.0/structured-contents/${articleId}`);
};

export const getNewestContent = () => {
  const queryParams = new URLSearchParams();
  queryParams.set('sort', 'dateCreated:desc');
  return fetchFromCMS<StructuredContentPage>(
    `/headless-delivery/v1.0/sites/${SCOPE_ID}/structured-contents?${queryParams}`,
  );
};

export const getCategoryContent = (categoryId: number) => {
  const queryParams = new URLSearchParams();
  queryParams.set('page', `1`);
  queryParams.set('pageSize', `500`);
  if (categoryId) {
    queryParams.set('filter', `taxonomyCategoryIds/any(t:t eq ${categoryId})`);
  }
  return fetchFromCMS<StructuredContentPage>(
    `/headless-delivery/v1.0/sites/${SCOPE_ID}/structured-contents?${queryParams}`,
  );
};
