import { type Category } from '@/types/cms-content';
import { getLocale } from '@/utils/navigation';
import { Accordion, Checkbox } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface TagFilterListProperties {
  tags: Category[];
  selectedTagIds: string[];
  ariaLabelId: string;
  emptyText?: string;
  mode?: 'default' | 'accordion';
  onTagSelectionChange: (tag: Category) => void;
}

const TagFilterList = ({
  tags,
  selectedTagIds,
  ariaLabelId,
  emptyText,
  mode = 'default',
  onTagSelectionChange,
}: TagFilterListProperties) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const [localSelectedTagIds, setLocalSelectedTagIds] = React.useState<string[]>(selectedTagIds);
  React.useEffect(() => {
    setLocalSelectedTagIds(selectedTagIds);
  }, [selectedTagIds]);

  const handleCheckboxChange = (tag: Category) => {
    const updatedTagIds = localSelectedTagIds.includes(`${tag.id}`)
      ? localSelectedTagIds.filter((id) => id !== `${tag.id}`)
      : [...localSelectedTagIds, `${tag.id}`];

    setLocalSelectedTagIds(updatedTagIds);
    onTagSelectionChange(tag);
  };

  return (
    <Wrapper mode={mode} ariaLabelId={ariaLabelId}>
      {tags.map((tag) => (
        <div key={tag.id} className="my-6 ml-4" data-testid={`tag-filter-item-${tag.id}`}>
          <Checkbox
            name="tag"
            value={`${tag.id}`}
            checked={localSelectedTagIds.some((selectedTagId) => tag.id.toString() === selectedTagId)}
            ariaLabel={t('search.tag-list.checkbox-label', {
              tag: tag.name_i18n[getLocale(language)] ?? tag.name,
            })}
            label={tag.name_i18n[getLocale(language)] ?? tag.name}
            onChange={() => handleCheckboxChange(tag)}
            data-testid={`tag-filter-checkbox-${tag.id}`}
          ></Checkbox>
        </div>
      ))}
      {tags.length === 0 && emptyText && <p>{emptyText}</p>}
    </Wrapper>
  );
};

const Wrapper = ({
  children,
  mode,
  ariaLabelId,
}: {
  children: React.ReactNode;
  mode: 'default' | 'accordion';
  ariaLabelId: string;
}) => {
  const { t } = useTranslation();
  return mode === 'default' ? (
    <div data-testid="tag-filter-list" role="group" aria-labelledby={ariaLabelId}>
      {children}
    </div>
  ) : (
    <Accordion
      initialState
      title={<span className="text-heading-4">{t('search.tag-list.title')}</span>}
      ariaLabel={t('search.tag-list.title')}
      data-testid="tag-filter-accordion"
    >
      <div className="pl-5" role="group" aria-labelledby={ariaLabelId}>
        {children}
      </div>
    </Accordion>
  );
};

export default TagFilterList;
