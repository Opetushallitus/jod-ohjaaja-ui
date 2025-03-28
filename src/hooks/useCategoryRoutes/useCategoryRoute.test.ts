import { getRoutes } from '@/routes';
import { renderHook } from '@testing-library/react';
import { useMatches } from 'react-router';
import { Mock, describe, expect, it, vi } from 'vitest';
import { useCategoryRoute } from './useCategoryRoute';

vi.mock('@/routes', () => {
  return {
    getRoutes: vi.fn(),
  };
});
vi.mock('react-router', () => ({
  useMatches: vi.fn(),
}));

describe('useCategoryRoute', () => {
  it('should return undefined when no category route matches', () => {
    (useMatches as Mock).mockReturnValue([
      { id: 'route1', handle: { type: 'Other' } },
      { id: 'route2', handle: null },
    ]);

    vi.mocked(getRoutes).mockReturnValue([{ id: 'route1' }, { id: 'route2' }]);

    const { result } = renderHook(() => useCategoryRoute());
    expect(result.current).toBeUndefined();
  });

  it('should return matching category route', () => {
    const expectedRoute = { id: 'category1', path: '/category' };

    (useMatches as Mock).mockReturnValue([
      { id: 'root' },
      { id: 'category1', handle: { type: 'CategoryListing', title: 'Category 1' } },
    ]);

    vi.mocked(getRoutes).mockReturnValue([expectedRoute]);

    const { result } = renderHook(() => useCategoryRoute());
    expect(result.current).toEqual(expectedRoute);
  });

  it('should find nested category route', () => {
    const expectedRoute = { id: 'subcategory', path: '/category/subcategory' };

    (useMatches as Mock).mockReturnValue([
      { id: 'Main' },
      { id: 'subcategory', handle: { type: 'CategoryListing', title: 'Subcategory' } },
    ]);

    vi.mocked(getRoutes).mockReturnValue([
      {
        id: 'root',
        children: [
          {
            id: 'category',
            children: [expectedRoute],
          },
        ],
      },
    ]);

    const { result } = renderHook(() => useCategoryRoute());
    expect(result.current).toEqual(expectedRoute);
  });
});
