import DOMPurify from 'dompurify';

import { tidyClasses as tc } from '@jod/design-system';

/** The kind of rich text content coming from the CMS. */
export type RichTextVariant = 'description' | 'article';

export interface SanitizeHtmlOptions {
  /** The base set of allowed tags and attributes. Defaults to 'description'. */
  variant?: RichTextVariant;
  /** Tags allowed in addition to the variant's base set. */
  additionalTags?: readonly string[];
  /** Attributes allowed in addition to the variant's base set. */
  additionalAttributes?: readonly string[];
}

const DESCRIPTION_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'a',
  'img',
  'blockquote',
  'hr',
  'sub',
  'sup',
];

const ARTICLE_TAGS = [
  ...DESCRIPTION_TAGS,
  'div',
  'span',
  'h5',
  'h6',
  'figure',
  'figcaption',
  'pre',
  'code',
  'small',
  'abbr',
  'del',
  'ins',
  'dl',
  'dt',
  'dd',
  'table',
  'thead',
  'tbody',
  'tfoot',
  'tr',
  'th',
  'td',
  'caption',
  'colgroup',
  'col',
];

const DESCRIPTION_ATTRIBUTES = [
  'href',
  'title',
  'target',
  'rel',
  'src',
  'alt',
  'width',
  'height',
  'loading',
  'lang',
  'dir',
];

const ARTICLE_ATTRIBUTES = [...DESCRIPTION_ATTRIBUTES, 'class', 'colspan', 'rowspan', 'scope'];

/**
 * An own DOMPurify instance, so that the hook registered below does not leak into sanitize calls made
 * elsewhere, nor is affected by hooks registered on the shared default instance by other modules.
 */
const purify = DOMPurify();

/** The path the whole service lives under, matching the router basename in main.tsx. */
const SERVICE_BASE_PATH = '/ohjaaja';

/**
 * Only http(s) and relative URLs are allowed in hrefs and other URI attributes. This is a narrowed down
 * version of the DOMPurify default, which also allows ftp(s), mailto, tel, callto, sms, cid and xmpp.
 */
const ALLOWED_URI_REGEXP = /^(?:https?:|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i;

/**
 * Whether the link leads out of the service, i.e. to another domain, or on the same domain to a path
 * outside the /ohjaaja context. Only http(s) and relative hrefs get this far, as ALLOWED_URI_REGEXP
 * drops the other protocols.
 *
 * @param href - The href of the link, absolute or relative
 * @returns true if the link leads out of the service
 */
const leadsOutOfService = (href: string): boolean => {
  if (href.startsWith('#')) {
    return false;
  }

  let url: URL;

  try {
    url = new URL(href, globalThis.location.href);
  } catch {
    return false;
  }

  if (url.origin !== globalThis.location.origin) {
    return true;
  }

  return url.pathname !== SERVICE_BASE_PATH && !url.pathname.startsWith(`${SERVICE_BASE_PATH}/`);
};

// Open only the links that lead out of the service in a new tab. This runs after attribute filtering,
// so the attributes set here are kept even though they are set on an anchor that had none.
purify.addHook('afterSanitizeAttributes', (node) => {
  if (node.nodeName !== 'A') {
    return;
  }

  const href = node.getAttribute('href');

  if (href && leadsOutOfService(href)) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener');
  } else {
    // The content editor may have set the attribute on a link that stays within the service
    node.removeAttribute('target');
  }
});

/**
 * Sanitize HTML coming from the CMS before it is injected with dangerouslySetInnerHTML.
 *
 * Only the tags and attributes of the given variant are kept, everything else is dropped. Notably
 * `style` is never allowed: the content editor leaves inline styles behind that break the page typography.
 * The text content of a disallowed tag is preserved, only the tag itself is removed. Of the link
 * protocols only http and https are allowed, so e.g. mailto: and tel: links are dropped.
 *
 * @param html - The unsafe HTML, or an empty value
 * @param options - Options for adjusting what is allowed
 * @returns The sanitized HTML, or an empty string if there was no content
 */
export const sanitizeHtml = (html: string | null | undefined, options: SanitizeHtmlOptions = {}): string => {
  if (!html) {
    return '';
  }

  const { variant = 'description', additionalTags = [], additionalAttributes = [] } = options;
  const isArticle = variant === 'article';

  return purify.sanitize(html, {
    ALLOWED_TAGS: [...(isArticle ? ARTICLE_TAGS : DESCRIPTION_TAGS), ...additionalTags],
    ALLOWED_ATTR: [...(isArticle ? ARTICLE_ATTRIBUTES : DESCRIPTION_ATTRIBUTES), ...additionalAttributes],
    // data-* attributes bypass ALLOWED_ATTR, so they have to be disabled separately. The article
    // variant needs them, as YouTube embeds are recognized by their data-embed-id attribute.
    ALLOW_DATA_ATTR: isArticle,
    ALLOWED_URI_REGEXP,
  });
};

const BASE_CLASSES = [
  '[&_p]:my-5',
  '[&_p]:first:my-0',
  '[&_li]:my-2',
  '[&_li]:ml-6',
  '[&_li]:list-item',
  '[&_ul]:list-disc',
  '[&_ol]:list-decimal',
  '[&_strong]:font-bold',
  '[&_img]:inline',
  '[&_h1]:text-heading-1',
  '[&_h2]:text-heading-2',
  '[&_h3]:text-heading-3',
  '[&_h4]:text-heading-4',
  '[&_a]:text-accent',
];

const DESCRIPTION_CLASSES = ['text-body-lg'];

const TABLE_CLASSES = [
  '[&_table]:border-collapse',
  '[&_table]:border',
  '[&_table]:border-gray-400',
  '[&_table_td]:border',
  '[&_table_td]:border-gray-400',
  '[&_table>caption]:font-bold',
  '[&_table>caption]:text-left',
];

/**
 * Get the classes for styling rich text content coming from the CMS.
 *
 * @param variant - The kind of content being styled, defaults to 'description'
 * @param additionalClasses - Classes appended after the variant's own classes
 * @returns The classes as a single string
 */
export const getRichTextClasses = (
  variant: RichTextVariant = 'description',
  additionalClasses: readonly string[] = [],
) => tc([...BASE_CLASSES, ...(variant === 'article' ? TABLE_CLASSES : DESCRIPTION_CLASSES), ...additionalClasses]);
