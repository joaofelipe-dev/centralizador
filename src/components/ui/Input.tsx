import React from 'react';
import { cn } from '../utils/cn';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'filled' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  status?: 'default' | 'error' | 'success' | 'warning';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      status = 'default',
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      readOnly,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn("relative flex items-center", fullWidth && "w-full")}>
        {leftIcon && <span className="absolute left-3 text-gray-500">{leftIcon}</span>}
        <input
          ref={ref}
          disabled={disabled}
          readOnly={readOnly}
          className={cn(
            "flex w-full rounded-md px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            {
              // Variants
              'border border-input bg-background': variant === 'default',
              'bg-secondary text-secondary-foreground border-transparent': variant === 'filled',
              'border-2 border-input bg-transparent': variant === 'outline',
              'border-transparent bg-transparent hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
              
              // Sizes
              'h-8 px-2 text-xs': size === 'sm',
              'h-10 px-3 py-2': size === 'md',
              'h-12 px-4 text-base': size === 'lg',
              
              // Status
              'border-red-500 focus-visible:ring-red-500': status === 'error',
              'border-green-500 focus-visible:ring-green-500': status === 'success',
              'border-yellow-500 focus-visible:ring-yellow-500': status === 'warning',
              
              // Icons padding
              'pl-10': leftIcon,
              'pr-10': rightIcon,
            },
            className
          )}
          {...props}
        />
        {rightIcon && <span className="absolute right-3 text-gray-500">{rightIcon}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
