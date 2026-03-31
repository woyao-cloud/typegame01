import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  label?: string;
  helperText?: string;
}

/**
 * 输入框组件 - 儿童友好风格
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error = false, label, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {/* 标签 */}
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}

        {/* 输入框 */}
        <input
          className={`
            w-full px-4 py-2.5 text-base
            bg-white
            border-2 rounded-xl
            transition-all duration-200
            outline-none
            spring-bounce
            ${error
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
              : 'border-gray-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-200'
            }
            ${className}
          `}
          ref={ref}
          {...props}
        />

        {/* 辅助文本 */}
        {helperText && (
          <p className={`mt-1 text-xs ${error ? 'text-red-600' : 'text-gray-500'}`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
