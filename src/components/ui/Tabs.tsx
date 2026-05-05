import React, { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState(defaultTab || (tabs.length > 0 ? tabs[0].id : ''));

  return (
    <div className={cn(
      "flex",
      orientation === 'vertical' ? 'flex-row space-x-4' : 'flex-col space-y-4',
      fullWidth && 'w-full',
      className
    )}>
      <div
        className={cn(
          "flex",
          orientation === 'vertical' ? 'flex-col space-y-1' : 'flex-row space-x-1 border-b border-gray-200',
          variant === 'solid' && orientation === 'horizontal' && 'border-none p-1 bg-gray-100 rounded-md',
        )}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={cn(
                "font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                {
                  // Size
                  'px-3 py-1.5 text-sm': size === 'sm',
                  'px-4 py-2 text-sm': size === 'md',
                  'px-6 py-3 text-base': size === 'lg',
                  
                  // Variants
                  'border-b-2 border-transparent hover:text-gray-700': variant === 'line' && !isActive && orientation === 'horizontal',
                  'border-b-2 border-primary text-primary': variant === 'line' && isActive && orientation === 'horizontal',
                  'border-l-2 border-transparent hover:text-gray-700 pl-4': variant === 'line' && !isActive && orientation === 'vertical',
                  'border-l-2 border-primary text-primary pl-4': variant === 'line' && isActive && orientation === 'vertical',
                  
                  'rounded-sm hover:bg-gray-200': variant === 'solid' && !isActive,
                  'rounded-sm bg-white text-gray-900 shadow-sm': variant === 'solid' && isActive,
                  
                  'rounded-full hover:bg-gray-100': variant === 'pills' && !isActive,
                  'rounded-full bg-primary text-white': variant === 'pills' && isActive,
                  
                  'flex-1 text-center': fullWidth && orientation === 'horizontal',
                }
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="flex-1">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              "outline-none",
              activeTab === tab.id ? 'block' : 'hidden'
            )}
            tabIndex={0}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};
