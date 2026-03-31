import * as React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string; icon?: string }[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * 选择器组件 - 儿童友好风格
 */
export const Select: React.FC<SelectProps> = ({
  value,
  onValueChange,
  options,
  placeholder = '请选择',
  label,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`relative ${className}`}>
      {/* 标签 */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      {/* 触发器 */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-2.5 text-base
          bg-white
          border-2 rounded-xl
          flex items-center justify-between
          transition-all duration-200
          spring-bounce
          ${disabled
            ? 'bg-gray-100 cursor-not-allowed'
            : 'hover:border-sky-400 cursor-pointer'
          }
          border-gray-300
        `}
      >
        <span className="flex items-center gap-2">
          {selectedOption?.icon && (
            <span className="text-lg">{selectedOption.icon}</span>
          )}
          <span className={selectedOption ? 'text-gray-800' : 'text-gray-400'}>
            {selectedOption?.label || placeholder}
          </span>
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* 菜单内容 */}
          <div
            className={`
              absolute z-20 w-full mt-1
              bg-white rounded-xl
              border-2 border-sky-200
              shadow-lg
              overflow-hidden
              dialog-slide-in
            `}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onValueChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-4 py-3 text-left
                  flex items-center gap-2
                  transition-colors duration-150
                  ${option.value === value
                    ? 'bg-sky-50 text-sky-600'
                    : 'hover:bg-gray-50'
                  }
                `}
              >
                {option.icon && <span className="text-lg">{option.icon}</span>}
                <span className="text-sm font-medium">{option.label}</span>
                {option.value === value && (
                  <span className="ml-auto text-sky-500">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
