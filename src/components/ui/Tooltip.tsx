import React, { useState, useRef, useEffect, useId } from 'react';
import { cn } from '../utils/cn';

export interface TooltipProps {
  position?: 'top' | 'bottom' | 'left' | 'right';
  variant?: 'dark' | 'light';
  delay?: number;
  disabled?: boolean;
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  position = 'top',
  variant = 'dark',
  delay = 200,
  disabled = false,
  content,
  children,
  className,
}) => {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const uid = useId();

  const clearTooltipTimeout = () => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const show = () => {
    if (disabled) return;
    clearTooltipTimeout();
    timeoutRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    clearTooltipTimeout();
    setVisible(false);
  };

  useEffect(() => {
    return () => clearTooltipTimeout();
  }, []);

  return (
    <div
      ref={triggerRef}
      className={cn('relative inline-block', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      aria-describedby={visible ? `${uid}-tooltip` : undefined}
    >
      {children}
      {visible && (
        <div
          id={`${uid}-tooltip`}
          role="tooltip"
          className={cn('absolute z-50 px-2 py-1 text-sm rounded shadow-md whitespace-nowrap', {
            'bg-tooltip text-tooltip-foreground': variant === 'dark',
            'bg-tooltip-light text-tooltip-light-foreground border border-tooltip-light-border': variant === 'light',
            'bottom-full left-1/2 -translate-x-1/2 mb-2': position === 'top',
            'top-full left-1/2 -translate-x-1/2 mt-2': position === 'bottom',
            'right-full top-1/2 -translate-y-1/2 mr-2': position === 'left',
            'left-full top-1/2 -translate-y-1/2 ml-2': position === 'right',
          })}
        >
          {content}
        </div>
      )}
    </div>
  );
};
