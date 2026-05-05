import React from 'react';
import { cn } from '../utils/cn';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'color'> {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'danger';
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, size = 'md', color = 'primary', checked, disabled, ...props }, ref) => {
    return (
      <label className={cn(
        "relative inline-flex items-center cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}>
        <input
          type="checkbox"
          ref={ref}
          className="sr-only peer"
          checked={checked}
          disabled={disabled}
          {...props}
        />
        <div className={cn(
          "bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer transition-colors peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:transition-all",
          {
            // Size mapping
            'w-9 h-5 after:h-4 after:w-4': size === 'sm',
            'w-11 h-6 after:h-5 after:w-5': size === 'md',
            'w-14 h-7 after:h-6 after:w-6': size === 'lg',
            
            // Color mapping when checked
            'peer-focus:ring-blue-300 peer-checked:bg-blue-600': color === 'primary',
            'peer-focus:ring-green-300 peer-checked:bg-green-600': color === 'success',
            'peer-focus:ring-red-300 peer-checked:bg-red-600': color === 'danger',
          }
        )}></div>
      </label>
    );
  }
);
Switch.displayName = 'Switch';
