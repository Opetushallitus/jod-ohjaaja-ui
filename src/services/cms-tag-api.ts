import { type Category } from '@/types/cms-content';
import { fetchFromCMS, SCOPE_ID } from './cms-api';

export const getTags = async () => {
  return fetchFromCMS<Category[]>(`/jod-tags/${SCOPE_ID}`);
};
