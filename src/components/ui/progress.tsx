import * as React from 'react';

interface ProgressProps {
  value: number; // 0-100
  max?: number;
  className?: string;
  showLabel?: boolean;
  color?: 'sky' | 'green' | 'yellow' | 'red' | 'purple';
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  className = '',
  showLabel = false,
  color = 'sky',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colorStyles = {
    sky: 'bg-sky-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* 背景轨道 - 带卡通阴影 */}
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden cartoon-shadow">
        {/* 进度条 - 带渐变和动画 */}
        <div
          className={`h-full ${colorStyles[color]} transition-all duration-300 ease-out rounded-full progress-fill rainbow-bg`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* 可选标签 - 带弹跳效果 */}
      {showLabel && (
        <span className="absolute right-0 -top-5 text-xs text-gray-600 bounce-in">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
};
