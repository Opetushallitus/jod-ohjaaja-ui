import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAnonId } from './anonId';

const MOCK_UUID = '00000000-0000-4000-a000-000000000000';
describe('getAnonId', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(MOCK_UUID);
  });

  it('should return existing anonId if present in localStorage', () => {
    localStorage.setItem('anonId', 'existing-id');
    expect(getAnonId()).toBe('existing-id');
  });

  it('should generate and store new anonId if not present in localStorage', () => {
    expect(getAnonId()).toBe(MOCK_UUID);
    expect(localStorage.getItem('anonId')).toBe(MOCK_UUID);
  });

  it('should call crypto.randomUUID only when generating new id', () => {
    const anonId1 = getAnonId();
    const anonId2 = getAnonId();
    expect(anonId1).toBe(anonId2);
    expect(crypto.randomUUID).toHaveBeenCalledTimes(1);
  });
});
