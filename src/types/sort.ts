export type Sort = 'a-z' | 'z-a' | 'latest' | 'oldest' | 'latest-added-to-favorites';

export const isSort = (value: string): value is Sort => {
  return ['a-z', 'z-a', 'latest', 'oldest', 'latest-added-to-favorites'].includes(value);
};
