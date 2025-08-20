import { isFeatureEnabled } from '@/api/features';
import { Feature } from '@/types/feature';
import React from 'react';

export const useFeature = (feature: Feature) => {
  const [isEnabled, setIsEnabled] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkFeature = async () => {
      const result = await isFeatureEnabled(feature);
      setIsEnabled(result);
    };

    checkFeature();
  }, [feature]);

  return isEnabled;
};
