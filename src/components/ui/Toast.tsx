import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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

const variantStyles: Record<string, string> = {
  success: 'bg-success text-success-foreground',
  error: 'bg-destructive text-destructive-foreground',
  warning: 'bg-warning text-warning-foreground',
  info: 'bg-primary text-primary-foreground',
};

const positionStyles: Record<string, string> = {
  top: 'top-4 left-1/2 -translate-x-1/2',
  bottom: 'bottom-4 left-1/2 -translate-x-1/2',
  'top-right': 'top-4 right-4',
  'bottom-right': 'bottom-4 right-4',
};

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

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  useEffect(() => {
    if (duration <= 0) return;

    timerRef.current = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [duration]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!visible) return null;

  const toast = (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'fixed z-50 flex items-center justify-between px-4 py-3 rounded shadow-lg min-w-[300px]',
        variantStyles[variant],
        positionStyles[position],
        className,
      )}
    >
      <span>{message}</span>
      {closable && (
        <button
          onClick={handleClose}
          className="ml-4 text-white hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
          aria-label="Fechar notificação"
        >
          &times;
        </button>
      )}
    </div>
  );

  return createPortal(toast, document.body);
};
