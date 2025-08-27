import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getTags } from './cms-tag-api';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('CMS TAG API', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      }),
    );
  });

  it('should fetch tags', async () => {
    await getTags();
    expect(mockFetch).toHaveBeenCalledWith('/ohjaaja/cms/o/jod-tags/20117', expect.any(Object));
  });

  it('should throw error on failed request', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        statusText: 'Not Found',
      }),
    );

    await expect(getTags()).rejects.toThrow('CMS API error: Not Found');
  });
});
