import React from 'react';
import { cn } from '../utils/cn';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  variant?: 'simple' | 'striped' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  selectable?: boolean;
  loading?: boolean;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  (
    {
      className,
      variant = 'simple',
      size = 'md',
      hoverable = false,
      selectable = false,
      loading = false,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        className={cn('relative w-full overflow-auto', loading && 'opacity-60 pointer-events-none')}
      >
        <table
          ref={ref}
          className={cn(
            'w-full caption-bottom text-sm',
            {
              'border-collapse': variant === 'simple',
              '[&_tbody_tr:nth-child(even)]:bg-muted': variant === 'striped',
              'border border-border [&_th]:border [&_td]:border': variant === 'bordered',

              '[&_th]:p-2 [&_td]:p-2': size === 'sm',
              '[&_th]:p-4 [&_td]:p-4': size === 'md',
              '[&_th]:p-6 [&_td]:p-6': size === 'lg',

              '[&_tbody_tr:hover]:bg-muted/50': hoverable,
              '[&_tbody_tr]:cursor-pointer': selectable,
            },
            className,
          )}
          {...props}
        >
          {children}
        </table>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <span className="text-muted-foreground font-medium">Loading...</span>
          </div>
        )}
      </div>
    );
  },
);
Table.displayName = 'Table';
