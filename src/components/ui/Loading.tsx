// T4.7 - 加载状态组件

import React from 'react';
import { Spinner } from './spinner';
export { Skeleton } from './skeleton';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 加载状态组件
 * 用于游戏加载、数据加载等场景
 */
export function Loading({ message = '加载中...', size = 'md' }: LoadingProps) {
  const sizeClasses = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const textClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div
      className={`flex flex-col items-center justify-center ${sizeClasses[size]}`}
    >
      <Spinner size={size} />
      <p className={`${textClasses[size]} text-gray-600 animate-pulse`}>
        {message}
      </p>
    </div>
  );
}

/**
 * 全屏加载组件
 */
export function FullScreenLoading({ message = '正在加载...' }: LoadingProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-sky-100/90 backdrop-blur-sm">
      <div className="text-center">
        <div className="text-6xl mb-6 animate-bounce">⌨️</div>
        <Loading message={message} size="lg" />
        <p className="mt-4 text-sm text-gray-500">
          准备好了吗？让我们一起快乐打字！
        </p>
      </div>
    </div>
  );
}
