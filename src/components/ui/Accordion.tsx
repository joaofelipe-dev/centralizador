import React, { useState, useId } from 'react';
import { cn } from '../utils/cn';

export interface AccordionItem {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
}

export interface AccordionProps {
  variant?: 'default' | 'bordered' | 'separated';
  multiple?: boolean;
  collapsible?: boolean;
  defaultOpen?: string[];
  items: AccordionItem[];
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  variant = 'default',
  multiple = false,
  collapsible = true,
  defaultOpen = [],
  items,
  className,
}) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpen));
  const uid = useId();

  const toggle = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      if (collapsible || newOpenItems.size > 1) {
        newOpenItems.delete(id);
      }
    } else {
      if (!multiple) {
        newOpenItems.clear();
      }
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    const currentIndex = items.findIndex((item) => item.id === id);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight')
      nextIndex = (currentIndex + 1) % items.length;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft')
      nextIndex = (currentIndex - 1 + items.length) % items.length;
    else if (e.key === 'Home') nextIndex = 0;
    else if (e.key === 'End') nextIndex = items.length - 1;
    else return;

    e.preventDefault();
    const nextItem = items[nextIndex];
    if (!nextItem) return;
    const nextId = nextItem.id;
    const nextButton = document.getElementById(`${uid}-trigger-${nextId}`);
    nextButton?.focus();
  };

  return (
    <div className={cn('w-full space-y-2', className)}>
      {items.map((item) => {
        const isOpen = openItems.has(item.id);
        const panelId = `${uid}-panel-${item.id}`;
        const triggerId = `${uid}-trigger-${item.id}`;

        return (
          <div
            key={item.id}
            className={cn('overflow-hidden', {
              'border-b border-border': variant === 'default' || variant === 'bordered',
              'border border-border rounded-md':
                variant === 'bordered' || variant === 'separated',
              'bg-background': variant === 'separated',
            })}
          >
            <h3>
              <button
                id={triggerId}
                className="flex items-center justify-between w-full py-4 px-2 text-left font-medium hover:bg-surface-hover transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset"
                onClick={() => toggle(item.id)}
                onKeyDown={(e) => handleKeyDown(e, item.id)}
                aria-expanded={isOpen}
                aria-controls={panelId}
              >
                <span>{item.title}</span>
                <span
                  className="text-muted-foreground transition-transform duration-200"
                  style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
                      fill="currentColor"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </button>
            </h3>
            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                className="px-2 pb-4 pt-1 text-sm text-muted-foreground"
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
