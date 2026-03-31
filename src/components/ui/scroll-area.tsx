import * as React from 'react';

export interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'vertical' | 'horizontal' | 'both';
}

/**
 * 滚动区域组件 - 儿童友好风格
 */
export const ScrollArea: React.FC<ScrollAreaProps> = ({
  children,
  className = '',
  orientation = 'vertical',
}) => {
  const overflowClasses = {
    vertical: 'overflow-y-auto overflow-x-hidden',
    horizontal: 'overflow-x-auto overflow-y-hidden',
    both: 'overflow-auto',
  };

  return (
    <div
      className={`
        relative
        ${overflowClasses[orientation]}
        ${className}
      `}
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#7DD3FC #E5E7EB',
      }}
    >
      {/* 自定义滚动条样式 */}
      <style>{`
        div::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        div::-webkit-scrollbar-track {
          background: #E5E7EB;
          border-radius: 4px;
        }
        div::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #7DD3FC, #38BDF8);
          border-radius: 4px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #38BDF8, #0EA5E9);
        }
      `}</style>
      {children}
    </div>
  );
};
