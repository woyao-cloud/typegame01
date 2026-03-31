import * as React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  label?: string;
  helperText?: string;
}

/**
 * 多行文本输入框组件 - 儿童友好风格
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', error = false, label, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {/* 标签 */}
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}

        {/* 文本域 */}
        <textarea
          className={`
            w-full px-4 py-2.5 text-base
            bg-white
            border-2 rounded-xl
            transition-all duration-200
            outline-none
            resize-y
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

Textarea.displayName = 'Textarea';
