import * as React from 'react';

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

/**
 * 警告提示组件 - 儿童友好风格
 */
export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const variantStyles = {
    info: {
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      text: 'text-sky-800',
      icon: 'ℹ️',
      closeBg: 'hover:bg-sky-100',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: '✅',
      closeBg: 'hover:bg-green-100',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: '⚠️',
      closeBg: 'hover:bg-yellow-100',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: '❌',
      closeBg: 'hover:bg-red-100',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className={`
        relative p-4 rounded-xl border-2
        ${style.bg} ${style.border}
        dialog-slide-in
        ${className}
      `}
    >
      {/* 图标和标题 */}
      <div className="flex items-start gap-3">
        <span className="text-xl">{style.icon}</span>
        <div className="flex-1">
          {title && (
            <h4 className={`font-bold mb-1 ${style.text}`}>
              {title}
            </h4>
          )}
          <div className={`text-sm ${style.text} opacity-90`}>
            {children}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`
              p-1 rounded-lg transition-colors
              ${style.closeBg}
            `}
            aria-label="关闭"
          >
            <span className="text-lg">✕</span>
          </button>
        )}
      </div>
    </div>
  );
};
