import * as React from 'react';
import { createRoot } from 'react-dom/client';

export interface ToastProps {
  id?: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  duration?: number;
  onClose?: () => void;
}

export interface ToastOptions {
  variant?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

// Toast 容器状态
let toastContainer: HTMLDivElement | null = null;
let toastRoot: ReturnType<typeof createRoot> | null = null;
let toasts: ToastProps[] = [];
let toastIdCounter = 0;

/**
 * 单个 Toast 组件
 */
const ToastItem: React.FC<ToastProps & { onClose: () => void }> = ({
  variant = 'info',
  title,
  message,
  onClose,
}) => {
  const variantStyles = {
    info: { bg: 'bg-sky-500', icon: 'ℹ️' },
    success: { bg: 'bg-green-500', icon: '✅' },
    warning: { bg: 'bg-yellow-500', icon: '⚠️' },
    error: { bg: 'bg-red-500', icon: '❌' },
  };

  const style = variantStyles[variant];

  return (
    <div
      className={`
        flex items-center gap-3 p-4 pr-12
        bg-white rounded-xl shadow-lg
        border-l-4 ${style.bg.replace('bg-', 'border-')}
        min-w-[300px] max-w-md
        animate-[slideIn_0.3s_ease-out]
      `}
      role="alert"
    >
      <span className="text-2xl">{style.icon}</span>
      <div className="flex-1">
        {title && (
          <h4 className="font-bold text-gray-800 text-sm">{title}</h4>
        )}
        <p className="text-gray-600 text-sm">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="absolute right-3 top-3 p-1 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <span className="text-gray-400">✕</span>
      </button>
    </div>
  );
};

/**
 * Toast 容器组件
 */
const ToastContainer: React.FC = () => {
  const [localToasts, setLocalToasts] = React.useState(toasts);

  const removeToast = (id: string) => {
    setLocalToasts((prev) => prev.filter((t) => t.id !== id));
    toasts = toasts.filter((t) => t.id !== id);
  };

  React.useEffect(() => {
    setLocalToasts([...toasts]);
  }, [toasts]);

  return (
    <div
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2"
      style={{
        maxWidth: 'calc(100vw - 2rem)',
      }}
    >
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      {localToasts.map((toast) => (
        <ToastItem
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id!)}
        />
      ))}
    </div>
  );
};

/**
 * 初始化 Toast 容器
 */
const ensureContainer = () => {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    document.body.appendChild(toastContainer);
    toastRoot = createRoot(toastContainer);
  }
  toastRoot?.render(<ToastContainer />);
};

/**
 * 添加 Toast 通知
 */
export const showToast = (
  message: string,
  options: ToastOptions & { title?: string } = {}
) => {
  ensureContainer();

  const id = `toast-${toastIdCounter++}`;
  const toast: ToastProps = {
    id,
    message,
    title: options.title,
    variant: options.variant || 'info',
    duration: options.duration || 3000,
  };

  toasts = [...toasts, toast];
  toastRoot?.render(<ToastContainer />);

  // 自动关闭
  if (toast.duration !== 0) {
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id);
      toastRoot?.render(<ToastContainer />);
    }, toast.duration);
  }

  return id;
};

/**
 * 快捷方法
 */
export const toast = {
  info: (message: string, options?: ToastOptions & { title?: string }) =>
    showToast(message, { ...options, variant: 'info' }),
  success: (message: string, options?: ToastOptions & { title?: string }) =>
    showToast(message, { ...options, variant: 'success' }),
  warning: (message: string, options?: ToastOptions & { title?: string }) =>
    showToast(message, { ...options, variant: 'warning' }),
  error: (message: string, options?: ToastOptions & { title?: string }) =>
    showToast(message, { ...options, variant: 'error' }),
};
