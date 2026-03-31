import * as React from 'react';

export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
  className?: string;
}

/**
 * 分隔线组件 - 儿童友好风格
 */
export const Separator: React.FC<SeparatorProps> = ({
  orientation = 'horizontal',
  decorative = true,
  className = '',
}) => {
  return (
    <div
      role={decorative ? undefined : 'separator'}
      aria-orientation={decorative ? undefined : orientation}
      className={`
        bg-gradient-to-r from-transparent via-sky-300 to-transparent
        ${orientation === 'horizontal'
          ? 'h-px w-full'
          : 'w-px h-full'
        }
        ${className}
      `}
    />
  );
};
