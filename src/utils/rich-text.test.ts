import { describe, expect, it } from 'vitest';

import { getRichTextClasses, sanitizeHtml } from './rich-text';

describe('rich-text utils', () => {
  describe('sanitizeHtml', () => {
    it('returns an empty string for empty content', () => {
      expect(sanitizeHtml('')).toBe('');
      expect(sanitizeHtml(undefined)).toBe('');
      expect(sanitizeHtml(null)).toBe('');
    });

    it('keeps allowed tags as they are', () => {
      const html = '<h2>Title</h2><p>Text with <strong>bold</strong> and <em>italic</em>.</p><ul><li>Item</li></ul>';
      expect(sanitizeHtml(html)).toBe(html);
    });

    it('removes inline styles but keeps the tag and its content', () => {
      expect(sanitizeHtml('<p style="color: red; font-size: 42px">Text</p>')).toBe('<p>Text</p>');
    });
    it('removes style tags', () => {
      expect(sanitizeHtml('<style>p { color: red; }</style><p>Text</p>')).toBe('<p>Text</p>');
    });

    it('removes class and data attributes', () => {
      expect(sanitizeHtml('<p class="cms-junk" data-foo="bar">Text</p>')).toBe('<p>Text</p>');
    });

    it('removes a disallowed tag but keeps its text content', () => {
      expect(sanitizeHtml('<div><span style="color: red">Text</span></div>')).toBe('Text');
    });

    it('removes scripts and event handlers', () => {
      expect(sanitizeHtml('<p>Text</p><script>alert(1)</script>')).toBe('<p>Text</p>');
      expect(sanitizeHtml('<img src="x.jpg" onerror="alert(1)">')).not.toContain('onerror');
    });

    it('removes a javascript: link but keeps the link text', () => {
      const result = sanitizeHtml('<a href="javascript:alert(1)">Text</a>');
      expect(result).not.toContain('javascript');
      expect(result).toContain('Text');
    });

    it('opens a link to another domain in a new tab', () => {
      const result = sanitizeHtml('<a href="https://example.com">Link</a>');
      expect(result).toContain('href="https://example.com"');
      expect(result).toContain('target="_blank"');
      expect(result).toContain('rel="noopener"');
    });

    it('opens a link outside the /ohjaaja context in a new tab', () => {
      expect(sanitizeHtml('<a href="/yksilo/fi/etusivu">Link</a>')).toBe(
        '<a href="/yksilo/fi/etusivu" target="_blank" rel="noopener">Link</a>',
      );
      expect(sanitizeHtml(`<a href="${globalThis.location.origin}/yksilo/fi/etusivu">Link</a>`)).toContain(
        'target="_blank"',
      );
    });

    it('does not open a link within the service in a new tab', () => {
      expect(sanitizeHtml('<a href="/ohjaaja/fi/artikkeli">Link</a>')).toBe('<a href="/ohjaaja/fi/artikkeli">Link</a>');
      expect(sanitizeHtml('<a href="/ohjaaja">Link</a>')).toBe('<a href="/ohjaaja">Link</a>');
      expect(sanitizeHtml(`<a href="${globalThis.location.origin}/ohjaaja/fi/artikkeli">Link</a>`)).not.toContain(
        'target',
      );
    });

    it('removes target from a link within the service', () => {
      expect(sanitizeHtml('<a href="/ohjaaja/fi/artikkeli" target="_blank">Link</a>')).toBe(
        '<a href="/ohjaaja/fi/artikkeli">Link</a>',
      );
    });

    it('does not open an anchor link in a new tab', () => {
      expect(sanitizeHtml('<a href="#section">Link</a>')).toBe('<a href="#section">Link</a>');
    });

    it('removes hrefs of other protocols than http and https', () => {
      expect(sanitizeHtml('<a href="mailto:someone@example.com">Text</a>')).toBe('<a>Text</a>');
      expect(sanitizeHtml('<a href="tel:+358401234567">Text</a>')).toBe('<a>Text</a>');
      expect(sanitizeHtml('<a href="ftp://example.com/file.zip">Text</a>')).toBe('<a>Text</a>');
      expect(sanitizeHtml('<a href="http://example.com">Text</a>')).toContain('href="http://example.com"');
    });

    it('keeps images with their alt text', () => {
      expect(sanitizeHtml('<img src="/image.jpg" alt="Alt text" width="100">')).toBe(
        '<img src="/image.jpg" alt="Alt text" width="100">',
      );
    });

    it('keeps class and data attributes needed by youtube embeds in the article variant', () => {
      const html = '<div class="embed-responsive" data-embed-id="https://www.youtube.com/embed/abc"></div>';
      expect(sanitizeHtml(html, { variant: 'article' })).toBe(html);
    });

    it('keeps tables in the article variant but not in the description variant', () => {
      const html = '<table><caption>Caption</caption><tbody><tr><td colspan="2">Cell</td></tr></tbody></table>';
      expect(sanitizeHtml(html, { variant: 'article' })).toBe(html);
      expect(sanitizeHtml(html)).toBe('CaptionCell');
    });

    it('removes inline styles also in the article variant', () => {
      expect(sanitizeHtml('<div style="margin: 100px"><p>Text</p></div>', { variant: 'article' })).toBe(
        '<div><p>Text</p></div>',
      );
    });

    it('allows extending the allowed tags and attributes', () => {
      expect(sanitizeHtml('<mark>Text</mark>', { additionalTags: ['mark'] })).toBe('<mark>Text</mark>');
      expect(sanitizeHtml('<p class="keep-me">Text</p>', { additionalAttributes: ['class'] })).toBe(
        '<p class="keep-me">Text</p>',
      );
    });
  });

  describe('getRichTextClasses', () => {
    it('returns the description classes by default', () => {
      const classes = getRichTextClasses();
      expect(classes).toContain('text-body-lg');
      expect(classes).toContain('[&_p]:my-5');
      expect(classes).toContain('[&_a]:text-accent');
      expect(classes).not.toContain('[&_table]:border-collapse');
    });

    it('returns the table classes for the article variant', () => {
      const classes = getRichTextClasses('article');
      expect(classes).toContain('[&_table]:border-collapse');
      expect(classes).toContain('[&_p]:my-5');
      expect(classes).not.toContain('text-body-lg');
    });

    it('appends additional classes', () => {
      expect(getRichTextClasses('description', ['mb-5'])).toContain('mb-5');
    });
  });
});
