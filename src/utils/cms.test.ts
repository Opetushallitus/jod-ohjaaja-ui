import { LangCode } from '@/i18n/config';
import { describe, expect, it } from 'vitest';
import { getAcceptLanguageHeader } from './cms';

describe('CMS utils', () => {
  describe('getAcceptLanguageHeader', () => {
    it('should return the header object with the corrent language string for a valid LangCode', () => {
      const langs = ['fi', 'en', 'sv'] as LangCode[];
      const resourceLanguages = ['fi-FI', 'en-US', 'sv-SE'];
      langs.forEach((lang, i) => {
        expect(getAcceptLanguageHeader(lang)['Accept-Language']).toBe(resourceLanguages[i]);
      });
    });

    it('should default to finnish with invalid input', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invalidLangs = [null, undefined, '', 0, false, NaN, {}] as any[];
      invalidLangs.forEach((lang) => {
        expect(getAcceptLanguageHeader(lang)['Accept-Language']).toBe('fi-FI');
      });
    });
  });
});
