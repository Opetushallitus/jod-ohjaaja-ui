import { NavigationItemType } from '@/types/cms-navigation';

const getCategoryListingLoader = (categoryId: number, navigationItemType: NavigationItemType) => () => {
  return { categoryId, navigationItemType };
};

export type LoaderData = ReturnType<ReturnType<typeof getCategoryListingLoader>>;
export default getCategoryListingLoader;
