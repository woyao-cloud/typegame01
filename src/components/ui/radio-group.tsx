import * as React from 'react';

export interface RadioOption {
  value: string;
  label: string;
  icon?: string;
}

export interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onValueChange: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  label?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * 单选框组组件 - 儿童友好风格
 */
export const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  value,
  onValueChange,
  orientation = 'vertical',
  label,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {label}
        </label>
      )}
      <div
        className={`
          flex gap-3
          ${orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'}
        `}
      >
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <label
              key={option.value}
              className={`
                inline-flex items-center gap-3 px-4 py-3
                rounded-xl border-2
                transition-all duration-200
                spring-bounce
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${isSelected
                  ? 'border-sky-500 bg-sky-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-sky-300 hover:shadow-sm'
                }
              `}
            >
              {/* 单选圆形指示器 */}
              <div
                className={`
                  w-5 h-5 rounded-full border-2
                  flex items-center justify-center
                  transition-colors duration-200
                  ${isSelected
                    ? 'border-sky-500 bg-sky-500'
                    : 'border-gray-300'
                  }
                `}
              >
                {isSelected && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>

              {/* 选项图标 */}
              {option.icon && (
                <span className="text-lg">{option.icon}</span>
              )}

              {/* 选项标签 */}
              <span className={`text-sm font-medium ${isSelected ? 'text-sky-700' : 'text-gray-700'}`}>
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};
