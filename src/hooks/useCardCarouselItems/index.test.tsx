import { type CardCarouselItem } from '@jod/design-system';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useCardCarouselItems } from './index';

describe('useCardCarouselItems', () => {
  it('should return empty array when producer returns empty array', () => {
    const producer = () => [];
    const { result } = renderHook(() => useCardCarouselItems(producer));
    expect(result.current).toEqual([]);
  });

  it('should return items from producer up to maximum limit', () => {
    const items: CardCarouselItem[] = Array(15)
      .fill({})
      .map((_, i) => ({
        id: i.toString(),
        component: <div>Item {i}</div>,
      }));
    const producer = () => items;
    const { result } = renderHook(() => useCardCarouselItems(producer));
    expect(result.current).toHaveLength(12);
    expect(result.current).toEqual(items.slice(0, 12));
  });

  it('should return all items when count is below maximum', () => {
    const items: CardCarouselItem[] = Array(5)
      .fill({})
      .map((_, i) => ({
        id: i.toString(),
        component: <div>Item {i}</div>,
      }));
    const producer = () => items;
    const { result } = renderHook(() => useCardCarouselItems(producer));
    expect(result.current).toHaveLength(5);
    expect(result.current).toEqual(items);
  });
});
