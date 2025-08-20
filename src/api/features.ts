import { type Feature } from '@/types/feature';
import { client } from './client';

export const isFeatureEnabled = async (feature: Feature) => {
  const { data, error } = await client.GET('/api/feature/{feature}', {
    params: {
      path: {
        feature,
      },
    },
  });
  if (error) {
    return false;
  }

  return data.enabled ?? false;
};
