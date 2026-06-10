import React from 'react';
import { cn } from '../utils/cn';

export interface SwitchProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size' | 'color'
> {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'danger';
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, size = 'md', color = 'primary', checked, disabled, ...props }, ref) => {
    return (
      <label
        className={cn(
          'relative inline-flex items-center cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed',
          className,
        )}
      >
        <input
          type="checkbox"
          ref={ref}
          className="sr-only peer"
          checked={checked}
          disabled={disabled}
          {...props}
        />
        <div
          className={cn(
            "peer-focus:outline-none peer-focus:ring-4 rounded-full peer transition-colors peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-switch-thumb after:border-border after:rounded-full after:transition-all bg-switch",
            {
              'w-9 h-5 after:h-4 after:w-4': size === 'sm',
              'w-11 h-6 after:h-5 after:w-5': size === 'md',
              'w-14 h-7 after:h-6 after:w-6': size === 'lg',

              'peer-focus:ring-ring peer-checked:bg-primary': color === 'primary',
              'peer-focus:ring-ring-success peer-checked:bg-success': color === 'success',
              'peer-focus:ring-ring peer-checked:bg-destructive': color === 'danger',
            },
          )}
        />
      </label>
    );
  },
);
Switch.displayName = 'Switch';
