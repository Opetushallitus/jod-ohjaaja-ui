import { type Category } from '@/types/cms-content';
import { getLocale } from '@/utils/navigation';
import { Accordion, Checkbox } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdOutlineExpandMore } from 'react-icons/md';

interface TagFilterListProperties {
  tags: Category[];
  selectedTagIds: string[];
  emptyText?: string;
  mode?: 'default' | 'accordion';
  itemsToShow?: number;
  onTagSelectionChange: (tag: Category) => void;
}

const TagFilterList = ({
  tags,
  selectedTagIds,
  emptyText,
  mode = 'default',
  itemsToShow = 10,
  onTagSelectionChange,
}: TagFilterListProperties) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const [visibleTags, setVisibleTags] = React.useState(mode == 'default' ? tags.slice(0, itemsToShow) : tags);
  const [localSelectedTagIds, setLocalSelectedTagIds] = React.useState<string[]>(selectedTagIds);
  React.useEffect(() => {
    setLocalSelectedTagIds(selectedTagIds);
  }, [selectedTagIds]);

  React.useEffect(() => {
    setVisibleTags(mode == 'default' ? tags.slice(0, itemsToShow) : tags);
  }, [tags, itemsToShow, mode]);

  const hasMore = visibleTags.length < tags.length;

  const handleShowMore = () => {
    setVisibleTags(tags.slice(0, visibleTags.length + itemsToShow));
  };

  const handleCheckboxChange = (tag: Category) => {
    const updatedTagIds = localSelectedTagIds.includes(`${tag.id}`)
      ? localSelectedTagIds.filter((id) => id !== `${tag.id}`)
      : [...localSelectedTagIds, `${tag.id}`];

    setLocalSelectedTagIds(updatedTagIds);
    onTagSelectionChange(tag);
  };

  return (
    <Wrapper mode={mode}>
      {visibleTags.map((tag) => (
        <div key={tag.id} className="my-4">
          <Checkbox
            name="tag"
            value={`${tag.id}`}
            checked={localSelectedTagIds.some((selectedTagId) => tag.id.toString() === selectedTagId)}
            ariaLabel={t('search.tag-list.checkbox-label', {
              tag: tag.name_i18n[getLocale(language)] ?? tag.name,
            })}
            label={tag.name_i18n[getLocale(language)] ?? tag.name}
            onChange={() => handleCheckboxChange(tag)}
          ></Checkbox>
        </div>
      ))}
      {tags.length === 0 && emptyText && <p>{emptyText}</p>}
      {hasMore && (
        <button onClick={handleShowMore} className="flex items-center text-button-sm px-5 py-2 cursor-pointer">
          {t('search.tag-list.show-more')} <MdOutlineExpandMore size={30} />
        </button>
      )}
    </Wrapper>
  );
};

const Wrapper = ({ children, mode }: { children: React.ReactNode; mode: 'default' | 'accordion' }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  return mode === 'default' ? (
    <div>{children}</div>
  ) : (
    <Accordion
      initialState
      lang={language}
      title={<span className="text-heading-4">{t('search.tag-list.title')}</span>}
      titleText={t('search.tag-list.title')}
    >
      <div className="pl-5">{children}</div>
    </Accordion>
  );
};

export default TagFilterList;
