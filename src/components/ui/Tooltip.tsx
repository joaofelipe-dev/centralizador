import React, { useState, useRef, useEffect } from 'react';
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
    if (disabled) return;
    clearTooltipTimeout();
    setVisible(false);
  };

  useEffect(() => {
    return () => clearTooltipTimeout();
  }, []);

  return (
    <div
      className={cn("relative inline-block", className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <div className={cn("absolute z-50 px-2 py-1 text-sm rounded shadow-md whitespace-nowrap", {
          'bg-gray-900 text-white': variant === 'dark',
          'bg-white text-gray-900 border border-gray-200': variant === 'light',
          'bottom-full left-1/2 -translate-x-1/2 mb-2': position === 'top',
          'top-full left-1/2 -translate-x-1/2 mt-2': position === 'bottom',
          'right-full top-1/2 -translate-y-1/2 mr-2': position === 'left',
          'left-full top-1/2 -translate-y-1/2 ml-2': position === 'right',
        })}>
          {content}
        </div>
      )}
    </div>
  );
};
