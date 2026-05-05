import React from 'react';
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
  return (
    <div
      className={cn(
        "flex",
        orientation === 'vertical' ? 'flex-col space-y-2' : 'flex-row space-x-4',
        className
      )}
      role="radiogroup"
    >
      {options.map((option) => {
        const isOptionDisabled = disabled || option.disabled;
        return (
          <label
            key={option.value}
            className={cn(
              "flex items-center cursor-pointer",
              isOptionDisabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="relative flex items-center">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                disabled={isOptionDisabled}
                onChange={() => onChange && onChange(option.value)}
                className="peer sr-only"
              />
              <div
                className={cn(
                  "rounded-full border border-primary flex items-center justify-center transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
                  {
                    'h-4 w-4': size === 'sm',
                    'h-5 w-5': size === 'md',
                    'h-6 w-6': size === 'lg',
                  }
                )}
              >
                {value === option.value && (
                  <div
                    className={cn(
                      "rounded-full bg-primary",
                      {
                        'h-2 w-2': size === 'sm',
                        'h-2.5 w-2.5': size === 'md',
                        'h-3 w-3': size === 'lg',
                      }
                    )}
                  />
                )}
              </div>
            </div>
            <span
              className={cn(
                "ml-2 text-gray-900",
                {
                  'text-sm': size === 'sm',
                  'text-base': size === 'md' || size === 'lg',
                }
              )}
            >
              {option.label}
            </span>
          </label>
        );
      })}
    </div>
  );
};
