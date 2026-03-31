import * as React from 'react';

export interface Tab {
  value: string;
  label: string;
  icon?: string;
}

export interface TabsProps {
  tabs: Tab[];
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export interface TabsListProps {
  tabs: Tab[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * 标签页列表组件 - 儿童友好风格
 */
export const TabsList: React.FC<TabsListProps> = ({
  tabs,
  value,
  onValueChange,
  className = '',
}) => {
  return (
    <div
      className={`
        inline-flex items-center gap-1 p-1
        bg-gray-100 rounded-xl
        ${className}
      `}
    >
      {tabs.map((tab) => {
        const isSelected = value === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onValueChange(tab.value)}
            className={`
              px-4 py-2 text-sm font-medium
              rounded-lg
              transition-all duration-200
              spring-bounce
              ${isSelected
                ? 'bg-white text-sky-600 shadow-md button-glow'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }
            `}
          >
            {tab.icon && <span className="mr-1.5">{tab.icon}</span>}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

/**
 * 标签页内容组件
 */
export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  children,
  className = '',
}) => {
  return (
    <div className={`${className}`}>
      {children}
    </div>
  );
};

/**
 * 标签页组件 - 整合版
 */
export const Tabs: React.FC<TabsProps> = ({
  tabs,
  value,
  onValueChange,
  children,
  className = '',
}) => {
  return (
    <div className={className}>
      <TabsList tabs={tabs} value={value} onValueChange={onValueChange} />
      {children}
    </div>
  );
};
