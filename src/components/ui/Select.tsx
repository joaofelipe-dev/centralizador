import React from 'react';
import { cn } from '../utils/cn';

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  variant?: 'default' | 'outline' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  status?: 'error' | 'success' | 'default';
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      status = 'default',
      multiple = false,
      searchable = false, // standard select doesn't easily support searchable, usually a custom component
      clearable = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative inline-flex w-full">
        <select
          ref={ref}
          multiple={multiple}
          className={cn(
            "flex w-full appearance-none rounded-md px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            {
              // Variant
              'border border-input bg-background': variant === 'default',
              'border-2 border-input bg-transparent': variant === 'outline',
              'bg-secondary text-secondary-foreground border-transparent': variant === 'filled',
              
              // Size
              'h-8 text-xs': size === 'sm' && !multiple,
              'h-10': size === 'md' && !multiple,
              'h-12 text-base': size === 'lg' && !multiple,
              
              // Status
              'border-red-500 focus:ring-red-500': status === 'error',
              'border-green-500 focus:ring-green-500': status === 'success',
            },
            className
          )}
          {...props}
        >
          {children}
        </select>
        {!multiple && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';
