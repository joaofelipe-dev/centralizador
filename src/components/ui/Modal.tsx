import React, { useRef, useEffect, useCallback } from 'react';
import { cn } from '../utils/cn';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface ModalProps {
  open: boolean;
  onClose?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'fullscreen' | 'centered';
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  size = 'md',
  variant = 'centered',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  title,
  description,
  children,
  className,
  overlayClassName,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !contentRef.current) return;

    const focusable = contentRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;

      requestAnimationFrame(() => {
        if (contentRef.current) {
          const first = contentRef.current.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
          first?.focus();
        }
      });

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && onClose) {
          onClose();
        }
        trapFocus(e);
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        previousFocusRef.current?.focus();
        previousFocusRef.current = null;
      };
    }
  }, [open, closeOnEsc, onClose, trapFocus]);

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm",
        variant === 'centered' ? 'flex items-center justify-center' : 'p-4',
        overlayClassName
      )}
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div
        ref={contentRef}
        className={cn(
          "bg-card rounded-lg shadow-lg overflow-hidden border border-border",
          {
            'w-full max-w-sm': size === 'sm',
            'w-full max-w-md': size === 'md',
            'w-full max-w-lg': size === 'lg',
            'w-full max-w-xl': size === 'xl',
            'w-full h-full max-w-none rounded-none': size === 'full' || variant === 'fullscreen',
            'mx-auto mt-10': variant === 'default' && size !== 'full',
          },
          className
        )}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {(title || description) && (
          <div className="px-6 py-4 border-b border-border">
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
        )}
        <div className="px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
};
