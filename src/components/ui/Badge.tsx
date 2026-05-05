import React from 'react';
import { cn } from '../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'solid' | 'outline' | 'soft';
  color?: 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'solid', color = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-full",
          {
            // Size
            'px-2 py-0.5 text-xs': size === 'sm',
            'px-2.5 py-0.5 text-sm': size === 'md',
            'px-3 py-1 text-base': size === 'lg',
            
            // Solid Variants
            'bg-blue-600 text-white': variant === 'solid' && color === 'primary',
            'bg-green-600 text-white': variant === 'solid' && color === 'success',
            'bg-yellow-500 text-white': variant === 'solid' && color === 'warning',
            'bg-red-600 text-white': variant === 'solid' && color === 'danger',
            
            // Outline Variants
            'border border-blue-600 text-blue-600': variant === 'outline' && color === 'primary',
            'border border-green-600 text-green-600': variant === 'outline' && color === 'success',
            'border border-yellow-500 text-yellow-600': variant === 'outline' && color === 'warning',
            'border border-red-600 text-red-600': variant === 'outline' && color === 'danger',
            
            // Soft Variants
            'bg-blue-100 text-blue-800': variant === 'soft' && color === 'primary',
            'bg-green-100 text-green-800': variant === 'soft' && color === 'success',
            'bg-yellow-100 text-yellow-800': variant === 'soft' && color === 'warning',
            'bg-red-100 text-red-800': variant === 'soft' && color === 'danger',
          },
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';
