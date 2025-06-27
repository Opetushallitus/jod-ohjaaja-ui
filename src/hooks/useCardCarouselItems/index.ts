import { type CardCarouselItem } from '@jod/design-system';
import React from 'react';

const MAX_CAROUSEL_ITEMS = 12;

export const useCardCarouselItems = (producer: () => CardCarouselItem[]) => {
  const [carouselItems, setCarouselItems] = React.useState<CardCarouselItem[]>([]);
  React.useEffect(() => {
    const items = producer();
    setCarouselItems(items.slice(0, MAX_CAROUSEL_ITEMS));
  }, [producer]);

  return carouselItems;
};
