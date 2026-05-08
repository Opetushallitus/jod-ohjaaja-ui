import React from 'react';

import { type CardCarouselItem } from '@jod/design-system';

const MAX_CAROUSEL_ITEMS = 12;

export const useCardCarouselItems = (producer: () => CardCarouselItem[]) => {
  return React.useMemo(() => {
    const items = producer();
    return items.slice(0, MAX_CAROUSEL_ITEMS);
  }, [producer]);
};
