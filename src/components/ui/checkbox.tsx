import * as React from 'react';

export interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * 复选框组件 - 儿童友好风格
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onCheckedChange,
  label,
  disabled = false,
  className = '',
}) => {
  return (
    <label
      className={`
        inline-flex items-center gap-3 cursor-pointer
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <div
        onClick={() => !disabled && onCheckedChange(!checked)}
        className={`
          w-6 h-6 rounded-lg
          border-2 flex items-center justify-center
          transition-all duration-200
          spring-bounce
          ${checked
            ? 'bg-sky-500 border-sky-500'
            : 'bg-white border-gray-300 hover:border-sky-400'
          }
        `}
      >
        {checked && (
          <span className="text-white text-sm font-bold">✓</span>
        )}
      </div>
      {label && (
        <span className="text-sm font-medium text-gray-700">{label}</span>
      )}
    </label>
  );
};
