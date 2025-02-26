import { describe, expect, it } from 'vitest';
import { sluggify } from './string-utils';

describe('sluggify', () => {
  const testCases = [
    { input: 'Test String', expected: 'test-string', desc: 'should convert to lowercase' },
    { input: 'hello world', expected: 'hello-world', desc: 'should replace spaces with hyphens' },
    { input: 'hello   world', expected: 'hello-world', desc: 'should handle multiple spaces' },
    { input: 'héllö wörld', expected: 'hello-world', desc: 'should remove diacritics' },
    { input: '', expected: '', desc: 'should handle empty string' },
    { input: '   ', expected: '', desc: 'should handle string with only spaces' },
  ];

  testCases.forEach(({ input, expected, desc }) => {
    it(desc, () => {
      expect(sluggify(input)).toBe(expected);
    });
  });
});
