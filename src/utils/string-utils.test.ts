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
    {
      input: 'Oikeus osata – Nivus',
      expected: 'oikeus-osata-nivus',
      desc: 'should handle multiple consecutive hyphens',
    },
    { input: 'Kotoutumisentukena.fi', expected: 'kotoutumisentukena-fi', desc: 'should replace dots with hyphens' },
    { input: 'Oppimisvaikeus.fi', expected: 'oppimisvaikeus-fi', desc: 'should replace dots with hyphens' },
    { input: 'hello--world', expected: 'hello-world', desc: 'should collapse multiple hyphens' },
    { input: '-leading-trailing-', expected: 'leading-trailing', desc: 'should remove leading and trailing hyphens' },
    { input: 'special!@#$chars', expected: 'special-chars', desc: 'should replace special characters with hyphens' },
  ];

  testCases.forEach(({ input, expected, desc }) => {
    it(desc, () => {
      expect(sluggify(input)).toBe(expected);
    });
  });
});
