import React, { useCallback, useRef } from 'react';
import { cn } from '../utils/cn';

export interface RadioOption {
  label: React.ReactNode;
  value: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  size = 'md',
  orientation = 'vertical',
  disabled = false,
  name,
  options,
  value,
  onChange,
  className,
}) => {
  const groupRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const enabledOptions = options
        .map((o, i) => ({ ...o, index: i }))
        .filter((o) => !(disabled || o.disabled));

      const currentIndex = enabledOptions.findIndex((o) => o.value === value);
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;

      if (orientation === 'horizontal') {
        if (e.key === 'ArrowRight') nextIndex = (currentIndex + 1) % enabledOptions.length;
        else if (e.key === 'ArrowLeft')
          nextIndex = (currentIndex - 1 + enabledOptions.length) % enabledOptions.length;
        else return;
      } else {
        if (e.key === 'ArrowDown') nextIndex = (currentIndex + 1) % enabledOptions.length;
        else if (e.key === 'ArrowUp')
          nextIndex = (currentIndex - 1 + enabledOptions.length) % enabledOptions.length;
        else return;
      }

      e.preventDefault();
      const nextOption = enabledOptions[nextIndex];
      if (!nextOption) return;
      const nextValue = nextOption.value;
      onChange?.(nextValue);
    },
    [options, value, disabled, orientation, onChange],
  );

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-orientation={orientation}
      className={cn(
        'flex',
        orientation === 'vertical' ? 'flex-col space-y-2' : 'flex-row space-x-4',
        className,
      )}
      onKeyDown={handleKeyDown}
    >
      {options.map((option) => {
        const isOptionDisabled = disabled || option.disabled;
        const isChecked = value === option.value;
        return (
          <label
            key={option.value}
            className={cn(
              'flex items-center cursor-pointer',
              isOptionDisabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            <div className="relative flex items-center">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isChecked}
                disabled={isOptionDisabled}
                onChange={() => onChange?.(option.value)}
                className="peer sr-only"
              />
              <div
                className={cn(
                  'rounded-full border border-primary flex items-center justify-center transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
                  {
                    'h-4 w-4': size === 'sm',
                    'h-5 w-5': size === 'md',
                    'h-6 w-6': size === 'lg',
                  },
                )}
              >
                {isChecked && (
                  <div
                    className={cn('rounded-full bg-primary', {
                      'h-2 w-2': size === 'sm',
                      'h-2.5 w-2.5': size === 'md',
                      'h-3 w-3': size === 'lg',
                    })}
                  />
                )}
              </div>
            </div>
            <span
              className={cn('ml-2 text-foreground', {
                'text-sm': size === 'sm',
                'text-base': size === 'md' || size === 'lg',
              })}
            >
              {option.label}
            </span>
          </label>
        );
      })}
    </div>
  );
};
