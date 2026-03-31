import * as React from 'react';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

/**
 * 工具提示组件 - 儿童友好风格
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 200,
  className = '',
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setShouldRender(true);
      setTimeout(() => setIsVisible(true), 10);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
    setTimeout(() => setShouldRender(false), 150);
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-sky-600',
    bottom: 'absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-sky-600',
    left: 'absolute left-full top-1/2 -translate-y-1/2 border-8 border-transparent border-l-sky-600',
    right: 'absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-sky-600',
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}

      {/* 提示框 */}
      {shouldRender && (
        <div
          className={`
            absolute z-50 px-3 py-2
            bg-sky-600 text-white text-sm font-medium
            rounded-xl shadow-lg
            whitespace-nowrap
            transition-all duration-150
            ${positionClasses[position]}
            ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          `}
          role="tooltip"
        >
          {content}
          {/* 箭头 */}
          <div className={arrowClasses[position]} />
        </div>
      )}
    </div>
  );
};
