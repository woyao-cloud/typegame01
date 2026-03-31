import * as React from 'react';
import { Button } from './button';

export interface ModeToggleProps {
  options: { value: string; label: string; icon: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * 模式切换组件 - 儿童友好风格
 */
export const ModeToggle: React.FC<ModeToggleProps> = ({
  options,
  value,
  onChange,
  className = '',
}) => {
  return (
    <div
      className={`
        inline-flex items-center gap-2 p-1
        bg-gray-100 rounded-xl
        ${className}
      `}
    >
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
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
            <span className="mr-1.5">{option.icon}</span>
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
