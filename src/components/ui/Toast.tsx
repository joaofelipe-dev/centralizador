import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '../utils/cn';

export interface ToastProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top' | 'bottom' | 'top-right' | 'bottom-right';
  closable?: boolean;
  message: string;
  onClose?: () => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  variant = 'info',
  duration = 3000,
  position = 'top-right',
  closable = true,
  message,
  onClose,
  className,
}) => {
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClose = useCallback(() => {
    setVisible(false);
    if (onClose) onClose();
  }, [onClose]);

  useEffect(() => {
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        handleClose();
      }, duration);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [duration, handleClose]);

  if (!visible) return null;

  return (
    <div className={cn(
      "fixed z-[130] flex items-center justify-between px-4 py-3 rounded shadow-lg min-w-[300px]",
      {
        'bg-green-500 text-white': variant === 'success',
        'bg-red-500 text-white': variant === 'error',
        'bg-yellow-500 text-white': variant === 'warning',
        'bg-blue-500 text-white': variant === 'info',
        'top-4 left-1/2 -translate-x-1/2': position === 'top',
        'bottom-4 left-1/2 -translate-x-1/2': position === 'bottom',
        'top-4 right-4': position === 'top-right',
        'bottom-4 right-4': position === 'bottom-right',
      },
      className
    )}>
      <span>{message}</span>
      {closable && (
        <button onClick={handleClose} className="ml-4 text-white hover:opacity-75 focus:outline-none">
          &times;
        </button>
      )}
    </div>
  );
};
