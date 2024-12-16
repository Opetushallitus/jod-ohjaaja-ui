import { StructuredContent } from '@/types/cms-content';

type ContentLabel = 'Tiivistelmä' | 'Kuvaus' | 'Kuva' | 'Tiedosto' | 'Linkki';

/**
 * Finds the content value from Liferay strucured content by label
 * @param item Structured content item
 * @param {ContentLabel} label Content label
 * @returns {ContentFieldValue | undefined} Content value
 */
export const findContentValueByLabel = (item: StructuredContent, label: ContentLabel) => {
  return item.contentFields?.find((field) => field.label === label)?.contentFieldValue;
};
