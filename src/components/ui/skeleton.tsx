import * as React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rounded';
}

/**
 * 骨架屏组件 - 加载状态占位符
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rounded',
}) => {
  const variantClasses = {
    text: 'h-4 w-full',
    circular: 'rounded-full',
    rounded: 'rounded-xl',
  };

  return (
    <div
      className={`
        bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200
        animate-pulse
        ${variantClasses[variant]}
        ${className}
      `}
      style={{
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite linear',
      }}
    />
  );
};

// 添加 shimmer 动画到全局样式
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
  `;
  if (!document.getElementById('skeleton-shimmer-style')) {
    style.id = 'skeleton-shimmer-style';
    document.head.appendChild(style);
  }
}
