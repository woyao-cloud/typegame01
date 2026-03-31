import * as React from 'react';

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

/**
 * 开关组件 - 儿童友好风格
 */
export const Switch: React.FC<SwitchProps> = ({
  checked,
  onCheckedChange,
  disabled = false,
  label,
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
        className={`
          relative w-14 h-8 rounded-full
          transition-colors duration-200
          ${checked ? 'bg-sky-500' : 'bg-gray-300'}
        `}
        onClick={() => !disabled && onCheckedChange(!checked)}
      >
        {/* 滑块 */}
        <div
          className={`
            absolute top-1 w-6 h-6 bg-white rounded-full
            shadow-md
            transition-transform duration-200
            spring-bounce
            ${checked ? 'translate-x-7' : 'translate-x-1'}
          `}
        >
          {/* 滑块图标 */}
          <div className="absolute inset-0 flex items-center justify-center">
            {checked ? (
              <span className="text-xs">✓</span>
            ) : (
              <span className="text-xs text-gray-400">○</span>
            )}
          </div>
        </div>
      </div>
      {label && (
        <span className="text-sm font-medium text-gray-700">{label}</span>
      )}
    </label>
  );
};
