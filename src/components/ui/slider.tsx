import * as React from 'react';

export interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * 滑块组件 - 儿童友好风格
 */
export const Slider: React.FC<SliderProps> = ({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  disabled = false,
  className = '',
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`w-full ${className}`}>
      {/* 标签和值 */}
      <div className="flex items-center justify-between mb-2">
        {label && (
          <label className="text-sm font-medium text-gray-700">{label}</label>
        )}
        {showValue && (
          <span className="text-sm font-bold text-sky-600 bg-sky-50 px-2 py-1 rounded-lg">
            {value}
          </span>
        )}
      </div>

      {/* 滑块轨道 */}
      <div
        className={`
          relative h-3 bg-gray-200 rounded-full
          cursor-pointer
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={(e) => {
          if (disabled) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const ratio = x / rect.width;
          const newValue = Math.round((ratio * (max - min) + min) / step) * step;
          onValueChange(Math.max(min, Math.min(max, newValue)));
        }}
      >
        {/* 已填充部分 */}
        <div
          className="absolute h-full bg-gradient-to-r from-sky-400 to-sky-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />

        {/* 滑块手柄 */}
        <div
          className={`
            absolute top-1/2 -translate-y-1/2
            w-6 h-6 bg-white border-4 border-sky-500 rounded-full
            shadow-lg
            transition-transform duration-150
            ${disabled ? '' : 'hover:scale-110 cursor-grab active:cursor-grabbing'}
            spring-bounce
          `}
          style={{ left: `calc(${percentage}% - 12px)` }}
        >
          {/* 手柄中心点 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-sky-400 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
