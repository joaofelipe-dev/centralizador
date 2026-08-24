import React from 'react';
import { cn } from '../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', fullWidth = false, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
          {
            // Variants
            'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/85':
              variant === 'default',
            'bg-destructive text-destructive-foreground hover:bg-destructive/90':
              variant === 'destructive',
            'border-2 border-border bg-background text-foreground hover:border-foreground/30 hover:bg-accent':
              variant === 'outline',
            'bg-secondary text-secondary-foreground hover:bg-secondary/85': variant === 'secondary',
            'text-foreground hover:bg-accent': variant === 'ghost',
            'text-primary underline-offset-4 hover:underline h-auto p-0': variant === 'link',

            // Sizes — 48px is the field-usable default; icon buttons never drop below the 44px touch floor.
            'h-12 px-4 py-2': size === 'default',
            'h-10 rounded-md px-3 text-xs': size === 'sm',
            'h-14 rounded-md px-8 text-base': size === 'lg',
            'h-11 w-11': size === 'icon',

            // Layout
            'w-full': fullWidth,
          },
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
