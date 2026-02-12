import { Sort } from '@/types/sort';
import { RadioButton, RadioButtonGroup } from '@jod/design-system';
import { JodSort } from '@jod/design-system/icons';
import { ButtonMenu } from './ButtonMenu';

export interface SortOption {
  label: string;
  value: string;
}

interface SortMenuProps {
  label: string;
  sort: Sort;
  onSortChange: (value: string) => void;
  options: SortOption[];
  className?: string;
  menuClassName?: string;
}

export const SortMenu = ({
  label,
  sort,
  onSortChange,
  options,
  className = 'justify-items-start lg:justify-items-end relative',
  menuClassName = 'left-0 lg:right-0 lg:left-auto',
}: SortMenuProps) => {
  return (
    <ButtonMenu
      triggerIcon={<JodSort size={18} className="text-secondary-2-dark" />}
      triggerLabel={label}
      className={className}
      menuClassName={menuClassName}
    >
      <RadioButtonGroup label={label} value={sort} onChange={onSortChange} hideLabel className="gap-2">
        {options.map((option) => (
          <RadioButton
            key={option.value}
            label={option.label}
            value={option.value}
            data-testid={`sort-${option.value}`}
            className="pr-7"
          />
        ))}
      </RadioButtonGroup>
    </ButtonMenu>
  );
};
