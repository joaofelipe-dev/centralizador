import React from 'react';
import { cn } from '../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'solid' | 'outline' | 'soft';
  color?: 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'solid', color = 'primary', size = 'md', children, ...props }, ref) => {
    const solidMap: Record<string, string> = {
      primary: 'bg-primary text-primary-foreground',
      success: 'bg-success text-success-foreground',
      warning: 'bg-warning text-warning-foreground',
      danger: 'bg-destructive text-destructive-foreground',
    };

    const outlineMap: Record<string, string> = {
      primary: 'border border-primary text-primary',
      success: 'border border-success text-success',
      warning: 'border border-warning text-warning',
      danger: 'border border-destructive text-destructive',
    };

    const softMap: Record<string, string> = {
      primary: 'bg-primary/10 text-primary',
      success: 'bg-success/10 text-success',
      warning: 'bg-warning/10 text-warning',
      danger: 'bg-destructive/10 text-destructive',
    };

    const variantMap = {
      solid: solidMap,
      outline: outlineMap,
      soft: softMap,
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-full',
          {
            'px-2 py-0.5 text-xs': size === 'sm',
            'px-2.5 py-0.5 text-sm': size === 'md',
            'px-3 py-1 text-base': size === 'lg',
          },
          variantMap[variant][color],
          className,
        )}
        {...props}
      >
        {children}
      </span>
    );
  },
);
Badge.displayName = 'Badge';
