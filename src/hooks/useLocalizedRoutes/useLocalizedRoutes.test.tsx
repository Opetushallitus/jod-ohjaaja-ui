import { getItemPath } from '@/utils/navigation-paths';
import { renderHook } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { useMatches, useParams, useSearchParams } from 'react-router';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLocalizedRoutes } from './useLocalizedRoutes';

// Mock the necessary hooks
vi.mock('react-router', () => ({
  useMatches: vi.fn(),
  useParams: vi.fn(),
  useSearchParams: vi.fn(),
  generatePath: vi.fn((path: string, params: Record<string, string>) => {
    Object.keys(params).forEach((key) => {
      path = path.replace(`:${key}`, params[key]);
    });
    return path;
  }),
}));

vi.mock('@/utils/navigation-paths', () => ({
  getItemPath: vi.fn(),
}));

vi.mock(import('react-i18next'), async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    useTranslation: vi.fn(),
  };
});

const defaultUseTranslationValue = { t: (key: string, { lng }: { lng: string }) => `${key}-${lng}` };

const mockReturnValues = (
  useMatchesValue: object[],
  useParamsValue: Record<string, string> = {},
  useTranslationValue = defaultUseTranslationValue,
  useSearchParamsValue: URLSearchParams = new URLSearchParams(),
) => {
  (useMatches as Mock).mockReturnValue(useMatchesValue);
  (useParams as Mock).mockReturnValue(useParamsValue);
  (useTranslation as Mock).mockReturnValue(useTranslationValue);
  (useSearchParams as Mock).mockReturnValue([useSearchParamsValue]);
};

describe('useLocalizedRoutes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate localized path with language in root', () => {
    mockReturnValues([{ id: 'root' }, { id: '1-1' }]);

    const { result } = renderHook(() => useLocalizedRoutes());
    const { generateLocalizedPath } = result.current;

    const path = generateLocalizedPath('en');
    expect(path).toBe('/en');
  });

  it('should replace path parameters with translations', () => {
    mockReturnValues([{ id: 'root' }, { id: '{slugs.profile.index}|${lng}' }]);

    const { result } = renderHook(() => useLocalizedRoutes());
    const { generateLocalizedPath } = result.current;

    const path = generateLocalizedPath('en');
    expect(path).toBe('/en/slugs.profile.index-en');
  });

  it('should handle multiple path segments', () => {
    mockReturnValues(
      [
        { id: 'root' },
        { id: '{slugs.job-opportunity.index}/:id|${lng}' },
        { id: '{slugs.job-opportunity.overview}|${lng}' },
      ],
      { id: '123' },
    );

    const { result } = renderHook(() => useLocalizedRoutes());
    const { generateLocalizedPath } = result.current;

    const path = generateLocalizedPath('en');
    expect(path).toBe('/en/slugs.job-opportunity.index-en/123/slugs.job-opportunity.overview-en');
  });

  it('should replace article path parameters with translations', () => {
    mockReturnValues([{ id: 'root' }, { id: 'Article|artikkeli|${lng}' }]);
    (getItemPath as Mock).mockReturnValue('article');

    const { result } = renderHook(() => useLocalizedRoutes());
    const { generateLocalizedPath } = result.current;

    const path = generateLocalizedPath('en');
    expect(path).toBe('/en/article');
  });
});
