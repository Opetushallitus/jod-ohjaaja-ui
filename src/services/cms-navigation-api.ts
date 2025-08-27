import { type CMSNavigationMenu } from '@/types/cms-navigation';
import { fetchFromCMS, SCOPE_ID } from './cms-api';

export const getNavigations = async () => {
  return fetchFromCMS<CMSNavigationMenu>(`/jod-navigation/${SCOPE_ID}`);
};
