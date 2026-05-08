import React from 'react';

import { isFeatureEnabled } from '@/api/features';
import { Feature } from '@/types/feature';

export const useFeature = (feature: Feature) => {
  const [isEnabled, setIsEnabled] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkFeature = async () => {
      const result = await isFeatureEnabled(feature);
      setIsEnabled(result);
    };

    void checkFeature();
  }, [feature]);

  return isEnabled;
};
