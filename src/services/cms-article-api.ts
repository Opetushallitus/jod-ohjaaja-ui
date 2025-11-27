import { type StructuredContent, type StructuredContentPage } from '@/types/cms-content';
import { type NavigationTreeItem } from '@/types/cms-navigation';
import { fetchFromCMS, SCOPE_ID } from './cms-api';
import { getNavigationTreeItems } from './navigation-loader';

export const getContentByArticleId = async (articleId: number) => {
  const queryParams = new URLSearchParams();
  queryParams.set('nestedFields', 'embeddedTaxonomyCategory');
  return fetchFromCMS<StructuredContent>(`/headless-delivery/v1.0/structured-contents/${articleId}?${queryParams}`);
};

export const getNewestContent = (ignoreCategoryId?: number) => {
  const queryParams = new URLSearchParams();
  queryParams.set('nestedFields', 'embeddedTaxonomyCategory');
  queryParams.set('page', `1`);
  queryParams.set('pageSize', `12`);
  queryParams.set('sort', 'dateCreated:desc');
  if (ignoreCategoryId) {
    queryParams.set('filter', `taxonomyCategoryIds/any(t:t ne ${ignoreCategoryId})`);
  }

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

export const searchContent = (searchTerm: string, tagIds: string[], page: number, pageSize: number, lang?: string) => {
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
    lang,
  );
};

export const getArticlesByErcs = (articleErcs: string[]) => {
  const articleIds = getArticleIds(articleErcs);
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

export const getArticleIds = (articleErcs: string[]): number[] => {
  return findArticleIds(getNavigationTreeItems(), articleErcs);
};

const findArticleIds = (navigationItems: readonly NavigationTreeItem[], articleErcs: string[]): number[] => {
  const ids = navigationItems
    .filter(
      (item) =>
        item.type === 'Article' && item.externalReferenceCode && articleErcs.includes(item.externalReferenceCode),
    )
    .map((item) => item.articleId)
    .filter((id): id is number => id !== undefined);

  return [...ids, ...navigationItems.flatMap((item) => findArticleIds(item.children, articleErcs))].filter(
    (id, index, self) => self.indexOf(id) === index,
  );
};
