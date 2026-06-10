import React from 'react';
import { cn } from '../utils/cn';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'circular' | 'dots' | 'bars';
  color?: 'primary' | 'neutral' | 'white';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'circular',
  color = 'primary',
  className,
}) => {
  const colorClass = {
    primary: 'text-primary',
    neutral: 'text-muted-foreground',
    white: 'text-white',
  }[color];

  const sizePx = {
    sm: { dot: 'h-1.5 w-1.5', bar: 'h-3 w-1' },
    md: { dot: 'h-2.5 w-2.5', bar: 'h-5 w-1.5' },
    lg: { dot: 'h-3.5 w-3.5', bar: 'h-7 w-2' },
  }[size];

  if (variant === 'dots') {
    return (
      <div className={cn('flex space-x-1', className)} role="status">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn('rounded-full motion-safe:animate-bounce', colorClass, sizePx.dot)}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (variant === 'bars') {
    return (
      <div className={cn('flex space-x-1', className)} role="status">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn('motion-safe:animate-pulse rounded', colorClass, sizePx.bar)}
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div role="status" className={cn(className)}>
      <svg
        className={cn(
          'motion-safe:animate-spin',
          {
            'h-4 w-4': size === 'sm',
            'h-8 w-8': size === 'md',
            'h-12 w-12': size === 'lg',
          },
          colorClass,
        )}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
};
