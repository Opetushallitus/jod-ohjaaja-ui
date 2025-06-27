import i18n, { LangCode } from '@/i18n/config';
import { Category, StructuredContent, StructuredContentPage } from '@/types/cms-content';
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
  const queryParams = new URLSearchParams();
  queryParams.set('nestedFields', 'embeddedTaxonomyCategory');
  return fetchFromCMS<StructuredContent>(`/headless-delivery/v1.0/structured-contents/${articleId}?${queryParams}`);
};

export const getNewestContent = () => {
  const queryParams = new URLSearchParams();
  queryParams.set('nestedFields', 'embeddedTaxonomyCategory');
  queryParams.set('page', `1`);
  queryParams.set('pageSize', `12`);
  queryParams.set('sort', 'dateCreated:desc');

  return fetchFromCMS<StructuredContentPage>(
    `/headless-delivery/v1.0/sites/${SCOPE_ID}/structured-contents?${queryParams}`,
  );
};

export const getCategoryContent = (categoryId: number, sort?: string) => {
  const queryParams = new URLSearchParams();
  queryParams.set('nestedFields', 'embeddedTaxonomyCategory');
  queryParams.set('page', `1`);
  queryParams.set('pageSize', `500`);
  if (sort) {
    queryParams.set('sort', 'dateCreated:desc');
  }
  if (categoryId) {
    queryParams.set('filter', `taxonomyCategoryIds/any(t:t eq ${categoryId})`);
  }
  return fetchFromCMS<StructuredContentPage>(
    `/headless-delivery/v1.0/sites/${SCOPE_ID}/structured-contents?${queryParams}`,
  );
};

export const searchContent = (searchTerm: string, tagIds: string[], page: number, pageSize: number) => {
  const queryParams = new URLSearchParams();
  queryParams.set('page', `${page}`);
  queryParams.set('pageSize', `${pageSize}`);
  queryParams.set('nestedFields', 'embeddedTaxonomyCategory');
  queryParams.set('search', searchTerm);
  if (tagIds.length > 0) {
    queryParams.set('filter', `taxonomyCategoryIds/any(t:t eq ${tagIds.join(' or t eq ')})`);
  }
  return fetchFromCMS<StructuredContentPage>(
    `/headless-delivery/v1.0/sites/${SCOPE_ID}/structured-contents?${queryParams}`,
  );
};

export const getArticles = (articleIds: number[]) => {
  const queryParams = new URLSearchParams();
  queryParams.set('page', `1`);
  queryParams.set('pageSize', `500`);
  queryParams.set('nestedFields', 'embeddedTaxonomyCategory');
  const idFilters = articleIds.map((id) => `id eq '${id}'`).join(' or ');
  queryParams.set('filter', idFilters);

  return fetchFromCMS<StructuredContentPage>(
    `/headless-delivery/v1.0/sites/${SCOPE_ID}/structured-contents?${queryParams}`,
  );
};

export const getTags = async () => {
  return fetchFromCMS<Category[]>(`/jod-tags/${SCOPE_ID}`);
};
