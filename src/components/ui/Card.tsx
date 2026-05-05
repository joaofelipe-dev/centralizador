import React from 'react';
import { cn } from '../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  fullWidth?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', interactive = false, fullWidth = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg bg-card text-card-foreground",
          {
            // Variants
            'border bg-white shadow-sm': variant === 'default',
            'border-2 border-gray-200': variant === 'outlined',
            'shadow-lg bg-white': variant === 'elevated',
            
            // Paddings
            'p-0': padding === 'none',
            'p-4': padding === 'sm',
            'p-6': padding === 'md',
            'p-8': padding === 'lg',
            
            // Interactive
            'transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer': interactive,
            
            // Layout
            'w-full': fullWidth,
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';
