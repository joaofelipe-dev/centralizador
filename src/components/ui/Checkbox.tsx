import React, { useEffect, useRef } from 'react';
import { cn } from '../utils/cn';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  indeterminate?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, size = 'md', indeterminate = false, checked, disabled, ...props }, ref) => {
    const internalRef = useRef<HTMLInputElement>(null);
    const resolvedRef = (ref as React.MutableRefObject<HTMLInputElement>) || internalRef;

    useEffect(() => {
      if (resolvedRef.current) {
        resolvedRef.current.indeterminate = indeterminate;
      }
    }, [resolvedRef, indeterminate]);

    return (
      <label className={cn("inline-flex items-center cursor-pointer", disabled && "opacity-50 cursor-not-allowed", className)}>
        <input
          type="checkbox"
          ref={resolvedRef}
          checked={checked}
          disabled={disabled}
          className={cn(
            "peer shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-primary checked:text-primary-foreground",
            {
              'h-3 w-3': size === 'sm',
              'h-4 w-4': size === 'md',
              'h-5 w-5': size === 'lg',
            }
          )}
          {...props}
        />
        {/* Placeholder for custom icon if needed, natively handles it somewhat okay with tailwind forms but custom styling is better */}
      </label>
    );
  }
);
Checkbox.displayName = 'Checkbox';
