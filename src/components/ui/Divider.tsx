import React from 'react';
import { cn } from '../utils/cn';

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement | HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed';
  spacing?: 'sm' | 'md' | 'lg';
}

export const Divider = React.forwardRef<HTMLDivElement | HTMLHRElement, DividerProps>(
  ({ className, orientation = 'horizontal', variant = 'solid', spacing = 'md', ...props }, ref) => {
    if (orientation === 'vertical') {
      return (
        <div
          ref={ref as React.ForwardedRef<HTMLDivElement>}
          className={cn(
            "inline-block w-px h-auto align-middle",
            {
              'bg-border': variant === 'solid',
              'border-l border-dashed': variant === 'dashed',
              'mx-2': spacing === 'sm',
              'mx-4': spacing === 'md',
              'mx-6': spacing === 'lg',
            },
            className
          )}
          {...(props as React.HTMLAttributes<HTMLDivElement>)}
        />
      );
    }

    return (
      <hr
        ref={ref as React.ForwardedRef<HTMLHRElement>}
        className={cn(
          "w-full border-t",
          {
            'border-solid': variant === 'solid',
            'border-dashed': variant === 'dashed',
            'my-2': spacing === 'sm',
            'my-4': spacing === 'md',
            'my-6': spacing === 'lg',
          },
          className
        )}
        {...(props as React.HTMLAttributes<HTMLHRElement>)}
      />
    );
  }
);
Divider.displayName = 'Divider';
