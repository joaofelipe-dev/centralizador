import React, { useState, useId, useCallback } from 'react';
import { cn } from '../utils/cn';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
}

export interface TabsProps {
  variant?: 'line' | 'solid' | 'pills';
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  fullWidth?: boolean;
  tabs: TabItem[];
  defaultTab?: string;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  variant = 'line',
  size = 'md',
  orientation = 'horizontal',
  fullWidth = false,
  tabs,
  defaultTab,
  className,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || (tabs.length > 0 ? tabs[0]?.id ?? '' : ''));
  const tablistRef = React.useRef<HTMLDivElement>(null);
  const uid = useId();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = tabs.findIndex((t) => t.id === activeTab);
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;

      if (orientation === 'horizontal') {
        if (e.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else {
        if (e.key === 'ArrowDown') nextIndex = (currentIndex + 1) % tabs.length;
        else if (e.key === 'ArrowUp') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      }

      if (e.key === 'Home') nextIndex = 0;
      else if (e.key === 'End') nextIndex = tabs.length - 1;

      if (nextIndex !== currentIndex) {
        e.preventDefault();
        const nextTab = tabs[nextIndex];
        if (!nextTab) return;
        const nextId = nextTab.id;
        setActiveTab(nextId);

        const nextButton = tablistRef.current?.querySelector<HTMLButtonElement>(
          `[data-tab-id="${nextId}"]`,
        );
        nextButton?.focus();
      }
    },
    [activeTab, tabs, orientation],
  );

  return (
    <div
      className={cn(
        'flex',
        orientation === 'vertical' ? 'flex-row space-x-4' : 'flex-col space-y-4',
        fullWidth && 'w-full',
        className,
      )}
    >
      <div
        ref={tablistRef}
        role="tablist"
        aria-orientation={orientation}
        className={cn(
          'flex',
          orientation === 'vertical'
            ? 'flex-col space-y-1'
            : 'flex-row space-x-1 border-b border-border',
          variant === 'solid' &&
            orientation === 'horizontal' &&
            'border-none p-1 bg-surface rounded-md',
        )}
        onKeyDown={handleKeyDown}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const panelId = `${uid}-panel-${tab.id}`;
          const tabId = `${uid}-tab-${tab.id}`;
          return (
            <button
              key={tab.id}
              id={tabId}
              data-tab-id={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              className={cn(
                'font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                {
                  'px-3 py-1.5 text-sm': size === 'sm',
                  'px-4 py-2 text-sm': size === 'md',
                  'px-6 py-3 text-base': size === 'lg',

                  'border-b-2 border-transparent hover:text-surface-foreground':
                    variant === 'line' && !isActive && orientation === 'horizontal',
                  'border-b-2 border-primary text-primary':
                    variant === 'line' && isActive && orientation === 'horizontal',
                  'border-l-2 border-transparent hover:text-surface-foreground pl-4':
                    variant === 'line' && !isActive && orientation === 'vertical',
                  'border-l-2 border-primary text-primary pl-4':
                    variant === 'line' && isActive && orientation === 'vertical',

                  'rounded-sm hover:bg-surface-hover': variant === 'solid' && !isActive,
                  'rounded-sm bg-background text-foreground shadow-sm': variant === 'solid' && isActive,

                  'rounded-full hover:bg-surface-hover': variant === 'pills' && !isActive,
                  'rounded-full bg-primary text-primary-foreground': variant === 'pills' && isActive,

                  'flex-1 text-center': fullWidth && orientation === 'horizontal',
                },
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="flex-1">
        {tabs.map((tab) => {
          const panelId = `${uid}-panel-${tab.id}`;
          const tabId = `${uid}-tab-${tab.id}`;
          return (
            <div
              key={tab.id}
              id={panelId}
              role="tabpanel"
              aria-labelledby={tabId}
              tabIndex={0}
              className={cn('outline-none', activeTab === tab.id ? 'block' : 'hidden')}
            >
              {tab.content}
            </div>
          );
        })}
      </div>
    </div>
  );
};
