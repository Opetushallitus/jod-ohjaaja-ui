import { type Category } from '@/types/cms-content';
import { getLocale } from '@/utils/navigation';
import { Accordion, Checkbox, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdOutlineExpandMore } from 'react-icons/md';

interface TagFilterListProperties {
  tags: Category[];
  selectedTagIds: string[];
  onTagSelectionChange: (tags: Category) => void;
}

const TagFilterList = ({ tags, selectedTagIds, onTagSelectionChange }: TagFilterListProperties) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const [visibleTags, setVisibleTags] = React.useState(tags.slice(0, 10));
  const [localSelectedTagIds, setLocalSelectedTagIds] = React.useState<string[]>(selectedTagIds);
  React.useEffect(() => {
    setLocalSelectedTagIds(selectedTagIds);
  }, [selectedTagIds]);

  const hasMore = visibleTags.length < tags.length;

  const handleShowMore = () => {
    setVisibleTags(tags.slice(0, visibleTags.length + 10));
  };

  const handleCheckboxChange = (tag: Category) => {
    const updatedTagIds = localSelectedTagIds.includes(`${tag.id}`)
      ? localSelectedTagIds.filter((id) => id !== `${tag.id}`)
      : [...localSelectedTagIds, `${tag.id}`];

    setLocalSelectedTagIds(updatedTagIds);
    onTagSelectionChange(tag);
  };

  return (
    <div className="bg-bg-gray-2 p-6 rounded">
      <WrapWithAccordionIfScreenSizeSmallerThanLarge>
        <h3 className="text-heading-3-mobile sm:text-heading-3 mb-4">{t('search.tag-list.title')}</h3>
        {visibleTags.map((tag) => (
          <div key={tag.id} className="my-4">
            <Checkbox
              name="tag"
              value={`${tag.id}`}
              checked={localSelectedTagIds.some((selectedTagId) => tag.id.toString() === selectedTagId)}
              variant="bordered"
              ariaLabel={t('search.tag-list.checkbox-label', {
                tag: tag.name_i18n[getLocale(language)] ?? tag.name,
              })}
              label={tag.name_i18n[getLocale(language)] ?? tag.name}
              onChange={() => handleCheckboxChange(tag)}
            ></Checkbox>
          </div>
        ))}
        {hasMore && (
          <button onClick={handleShowMore} className="flex items-center text-button-sm px-5 py-2 cursor-pointer">
            {t('search.tag-list.show-more')} <MdOutlineExpandMore size={30} />
          </button>
        )}
      </WrapWithAccordionIfScreenSizeSmallerThanLarge>
    </div>
  );
};

interface WrapWithAccordionIfScreenSizeLargeProps {
  children: React.ReactNode;
}

const WrapWithAccordionIfScreenSizeSmallerThanLarge = ({ children }: WrapWithAccordionIfScreenSizeLargeProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { lg } = useMediaQueries();
  return !lg ? (
    <Accordion title={t('search.tag-list.accordion-title')} lang={language} initialState={false}>
      {children}
    </Accordion>
  ) : (
    children
  );
};

export default TagFilterList;
