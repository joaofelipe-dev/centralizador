import React from 'react';
import { cn } from '../utils/cn';

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
}) => {
  React.useEffect(() => {
    if (!closeOnEsc) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, closeOnEsc, onClose]);

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
        variant === 'centered' ? 'flex items-center justify-center' : 'p-4'
      )}
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div
        className={cn(
          "bg-white rounded-lg shadow-lg overflow-hidden",
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
          <div className="px-6 py-4 border-b">
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
          </div>
        )}
        <div className="px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
};
