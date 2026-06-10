import React from 'react';
import { cn } from '../utils/cn';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  src?: string;
  fallback: string;
  status?: 'online' | 'offline' | 'busy';
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = 'md', shape = 'circle', src, fallback, status, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center bg-muted text-muted-foreground font-medium overflow-hidden',
          {
            'h-8 w-8 text-xs': size === 'sm',
            'h-10 w-10 text-sm': size === 'md',
            'h-12 w-12 text-base': size === 'lg',
            'h-14 w-14 text-lg': size === 'xl',
            'rounded-full': shape === 'circle',
            'rounded-md': shape === 'square',
          },
          className,
        )}
        {...props}
      >
        {src ? (
          <img src={src} alt={fallback} className="h-full w-full object-cover" />
        ) : (
          <span>{fallback}</span>
        )}

        {status && (
          <span
            className={cn('absolute bottom-0 right-0 block rounded-full ring-2 ring-white', {
              'bg-success': status === 'online',
              'bg-muted-foreground': status === 'offline',
              'bg-destructive': status === 'busy',
              'h-2 w-2': size === 'sm',
              'h-2.5 w-2.5': size === 'md',
              'h-3 w-3': size === 'lg',
              'h-3.5 w-3.5': size === 'xl',
            })}
          />
        )}
      </div>
    );
  },
);
Avatar.displayName = 'Avatar';
