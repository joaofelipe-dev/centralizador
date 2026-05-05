import React from 'react';
import { cn } from '../utils/cn';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'circular' | 'dots' | 'bars';
  color?: 'primary' | 'neutral' | 'white';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', variant = 'circular', color = 'primary', className }) => {
  const colorClass = {
    primary: 'text-blue-600',
    neutral: 'text-gray-500',
    white: 'text-white',
  }[color];

  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }[size];

  if (variant === 'dots') {
    return (
      <div className={cn("flex space-x-1", className)} role="status">
        <div className={cn("rounded-full animate-bounce", colorClass, {
          'h-1.5 w-1.5': size === 'sm',
          'h-2.5 w-2.5': size === 'md',
          'h-3.5 w-3.5': size === 'lg',
        })}></div>
        <div className={cn("rounded-full animate-bounce", colorClass, {
          'h-1.5 w-1.5': size === 'sm',
          'h-2.5 w-2.5': size === 'md',
          'h-3.5 w-3.5': size === 'lg',
        })} style={{ animationDelay: '0.1s' }}></div>
        <div className={cn("rounded-full animate-bounce", colorClass, {
          'h-1.5 w-1.5': size === 'sm',
          'h-2.5 w-2.5': size === 'md',
          'h-3.5 w-3.5': size === 'lg',
        })} style={{ animationDelay: '0.2s' }}></div>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // Circular as default
  return (
    <div role="status" className={cn(className)}>
      <svg
        className={cn("animate-spin", sizeClass, colorClass)}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
};
