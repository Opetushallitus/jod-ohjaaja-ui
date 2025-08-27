import { components } from '@/api/schema';
import { type LangCode } from '@/i18n/config';
import type { Category, ContentLink, StructuredContent } from '@/types/cms-content';
import { type NavigationTreeItem } from '@/types/cms-navigation';
import { type Sort } from '@/types/sort';
import DOMPurify from 'dompurify';
import { getCategoryArticleIds } from './navigation';

type ContentName = 'ingress' | 'content' | 'image' | 'document' | 'link';
const AdaptiveMediaSizes = {
  thumbnail: 'Thumbnail-300x300',
  preview: 'Preview-1000x0',
};

DOMPurify.addHook('afterSanitizeAttributes', function (node) {
  // set all elements owning target to target=_blank
  if ('target' in node) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener');
  }
});

/**
 * Finds the content value from Liferay strucured content by label
 * @param item Structured content item
 * @param {ContentLabel} label Content label
 * @returns {ContentFieldValue | undefined} Content value
 */
export const findContentValueByName = (item: StructuredContent, name: ContentName) => {
  return item.contentFields?.find((field) => field.name === name)?.contentFieldValue;
};

/**
 * Get the Accept-Language header based on the language code
 * @param {LangCode} language Language code
 * @returns {Record<string, string>} Accept-Language header
 */
export const getAcceptLanguageHeader = (language: LangCode) => {
  let resourceLangCode = 'fi-FI';

  if (language === 'en') {
    resourceLangCode = 'en-US';
  } else if (language === 'sv') {
    resourceLangCode = 'sv-SE';
  }

  return { 'Accept-Language': resourceLangCode };
};

/**
 * Generates the URL for an adaptive media image in Liferay.
 *
 * @param fileId - The ID of the Liferay image file entry.
 * @param fileName - The name of the file.
 * @param size - The desired image size, as a key of AdaptiveMediaSizes.
 * @returns The adaptive media image URL or an empty string if inputs are invalid.
 */
export const getAdaptiveMediaSrc = (
  fileId: number | undefined,
  fileName: string | undefined,
  size: keyof typeof AdaptiveMediaSizes,
): string => {
  if (fileId === undefined || fileName === undefined) {
    return '';
  }

  const mediaSize = AdaptiveMediaSizes[size];
  return `/ohjaaja/cms/o/adaptive-media/image/${fileId}/${mediaSize}/${fileName}`;
};

/**
 * Get the title of the structured content
 *
 * @param item - The structured content
 * @returns The title of the structured content
 */
export const getTitle = (item: StructuredContent) => {
  return item.title;
};

/**
 * Get the ingress of the structured content
 *
 * @param item - The structured content
 * @returns The ingress of the structured content or an empty string if not found
 */
export const getIngress = (item: StructuredContent) => {
  return findContentValueByName(item, 'ingress')?.data ?? '';
};

/**
 * Get the image of the structured content
 *
 * @param item - The structured content
 * @returns The image of the structured content or undefined if not found
 */
export const getImage = (item: StructuredContent) => {
  return findContentValueByName(item, 'image')?.image;
};

/**
 * Get the content of the structured content
 *
 * @param item - The structured content
 * @returns The content of the structured content or an empty string if not found
 */
export const getContent = (item: StructuredContent) => {
  const content = DOMPurify.sanitize(findContentValueByName(item, 'content')?.data ?? '');
  const div = document.createElement('div');
  div.innerHTML = content;
  div.querySelectorAll('div.embed-responsive').forEach((embed) => {
    const url = new URL(embed.getAttribute('data-embed-id') ?? '');
    const style = embed.getAttribute('style');
    if (['youtube.com', 'www.youtube.com', 'youtu.be', 'www.youtube-nocookie.com'].includes(url.hostname)) {
      const iframeWrapper = document.createElement('div');
      iframeWrapper.setAttribute('class', 'aspect-video');
      iframeWrapper.setAttribute('style', style ?? '');
      const iframe = document.createElement('iframe');
      iframe.setAttribute('src', url.toString());
      iframe.setAttribute('class', 'w-full h-full');
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allowfullscreen', 'true');
      iframe.setAttribute(
        'allow',
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
      );
      iframeWrapper.appendChild(iframe);
      embed.replaceWith(iframeWrapper);
    }
  });
  return div.innerHTML;
};

/**
 * Get the links of the structured content
 *
 * @param item - The structured content
 * @returns The links of the structured content or an empty array if not found
 */
export const getLinks = (item: StructuredContent): ContentLink[] => {
  const links = item.contentFields
    ?.filter((field) => field.name === 'link')
    .map((linkContentField) => {
      const text = linkContentField.nestedContentFields.find((field) => field.name === 'linktext')?.contentFieldValue
        ?.data;
      const url = linkContentField.nestedContentFields.find((field) => field.name === 'linkurl')?.contentFieldValue
        ?.data;

      if (text === undefined || text.trim() === '' || url === undefined || url.trim() === '') {
        return null;
      }
      return { text, url };
    })
    .filter((link) => link !== null);

  return links ?? [];
};

/**
 * Get the documents of the structured content
 *
 * @param item - The structured content
 * @returns The documents of the structured content or an empty array if not found
 */
export const getDocuments = (item: StructuredContent) => {
  const documents = item.contentFields
    ?.filter((field) => field.name === 'document')
    .map((documentContentField) => documentContentField.contentFieldValue.document)
    .filter((document) => document !== undefined);

  return documents ?? [];
};

/**
 * Get the keywords of the structured content
 *
 * @param item - The structured content
 * @returns The keywords of the structured content or an empty array if not found
 */
export const getKeywords = (item: StructuredContent): Category[] => {
  return (
    item.taxonomyCategoryBriefs
      ?.filter((categoryBrief) => categoryBrief?.embeddedTaxonomyCategory?.type === 'TAG')
      .map((categoryBrief) => ({
        id: categoryBrief.taxonomyCategoryId,
        name: categoryBrief.taxonomyCategoryName,
        name_i18n: categoryBrief.embeddedTaxonomyCategory?.name_i18n ?? {},
        type: 'TAG',
      })) ?? []
  );
};

/**
 * Group articles by their category based on the navigation tree
 *
 * @param articles
 * @param navigationTreeItems
 * @returns An object where the keys are category titles and the values are arrays of articles
 *          belonging to those categories
 */
export const groupArticlesByCategory = (articles: StructuredContent[], navigationTreeItems: NavigationTreeItem[]) => {
  return navigationTreeItems.reduce(
    (acc, item) => {
      const categoryArticleIds = getCategoryArticleIds(item);
      const categoryArticles = articles.filter((article) => article.id && categoryArticleIds.includes(article.id));
      if (categoryArticles.length > 0) {
        acc[item.title] = categoryArticles;
      }
      return acc;
    },
    {} as Record<string, StructuredContent[]>,
  );
};

/**
 * Filter articles by their tags
 * @param articles The articles to filter
 * @param tagIds The tags to filter by
 * @returns The filtered articles
 */
export const filterArticlesByTags = (articles: StructuredContent[], tagIds: string[]) => {
  return articles.filter((article) => {
    const articleTags = getKeywords(article);
    return articleTags.some((tag) => tagIds.includes(`${tag.id}`));
  });
};

/**
 * Sort articles based on the selected criteria
 * @param articles The articles to sort
 * @param sort The sorting criteria
 * @param suosikit The user's favorite articles - optional
 * @returns The sorted articles
 */
export const sortArticles = (
  articles: StructuredContent[],
  sort: Sort,
  suosikit?: components['schemas']['SuosikkiDto'][],
) => {
  switch (sort) {
    case 'a-z':
      return articles.sort((a, b) => {
        return a.title.localeCompare(b.title);
      });
    case 'z-a':
      return articles.sort((a, b) => {
        return b.title.localeCompare(a.title);
      });
    case 'latest':
      return articles.sort((a, b) => {
        return new Date(b.dateCreated ?? Date.now()).getTime() - new Date(a.dateCreated ?? Date.now()).getTime();
      });
    case 'oldest':
      return articles.sort((a, b) => {
        return new Date(a.dateCreated ?? Date.now()).getTime() - new Date(b.dateCreated ?? Date.now()).getTime();
      });
    case 'latest-added-to-favorites':
      if (!suosikit) return articles;
      return articles.sort((a, b) => {
        const aDate = suosikit.find((suosikki) => suosikki.artikkeliErc === a.externalReferenceCode)?.luotu;
        const bDate = suosikit.find((suosikki) => suosikki.artikkeliErc === b.externalReferenceCode)?.luotu;
        return new Date(bDate ?? Date.now()).getTime() - new Date(aDate ?? Date.now()).getTime();
      });
    default:
      return articles;
  }
};
