import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getNavigations } from './cms-navigation-api';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('CMS ARTICLE API', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      }),
    );
  });

  it('should fetch navigation menu', async () => {
    await getNavigations();
    expect(mockFetch).toHaveBeenCalledWith('/ohjaaja/cms/o/jod-navigation/20117', expect.any(Object));
  });
});
