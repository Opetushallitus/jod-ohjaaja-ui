import { LangCode } from '@/i18n/config';
import { StructuredContent } from '@/types/cms-content';

type ContentName = 'ingress' | 'content' | 'image' | 'document' | 'link';
const AdaptiveMediaSizes = {
  thumbnail: 'Thumbnail-300x300',
  preview: 'Preview-1000x0',
};

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
