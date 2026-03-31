import * as React from 'react';

export interface PopoverProps {
  content: React.ReactNode;
  children: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  className?: string;
  contentClassName?: string;
}

/**
 * 弹出框组件 - 儿童友好风格
 */
export const Popover: React.FC<PopoverProps> = ({
  content,
  children,
  isOpen: controlledIsOpen,
  onOpenChange,
  position = 'bottom',
  align = 'center',
  className = '',
  contentClassName = '',
}) => {
  const [internalIsOpen, setInternalIsOpen] = React.useState(false);

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const setIsOpen = (open: boolean) => {
    if (!isControlled) {
      setInternalIsOpen(open);
    }
    onOpenChange?.(open);
  };

  const positionClasses = {
    top: 'bottom-full pb-2',
    bottom: 'top-full pt-2',
    left: 'right-full pr-2',
    right: 'left-full pl-2',
  };

  const alignClasses = {
    top: {
      start: 'left-0',
      center: 'left-1/2 -translate-x-1/2',
      end: 'right-0',
    },
    bottom: {
      start: 'left-0',
      center: 'left-1/2 -translate-x-1/2',
      end: 'right-0',
    },
    left: {
      start: 'top-0',
      center: 'top-1/2 -translate-y-1/2',
      end: 'bottom-0',
    },
    right: {
      start: 'top-0',
      center: 'top-1/2 -translate-y-1/2',
      end: 'bottom-0',
    },
  };

  const arrowClasses = {
    top: 'absolute top-full left-1/2 -translate-x-1/2 -mt-2',
    bottom: 'absolute bottom-full left-1/2 -translate-x-1/2 -mb-2',
    left: 'absolute left-full top-1/2 -translate-y-1/2 -ml-2',
    right: 'absolute right-full top-1/2 -translate-y-1/2 -mr-2',
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* 触发器 */}
      <div onClick={() => setIsOpen(!isOpen)}>{children}</div>

      {/* 弹出内容 */}
      {isOpen && (
        <>
          {/* 遮罩层 (点击外部关闭) */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* 弹出框 */}
          <div
            className={`
              absolute z-50
              ${positionClasses[position]}
              ${alignClasses[position][align]}
            `}
          >
            <div
              className={`
                relative
                bg-white rounded-xl shadow-2xl border-2 border-sky-200
                p-4 min-w-[200px] max-w-[300px]
                dialog-slide-in
                ${contentClassName}
              `}
            >
              {content}

              {/* 箭头 */}
              <div
                className={`
                  w-4 h-4 bg-white border-sky-200
                  transform rotate-45
                  ${arrowClasses[position]}
                `}
                style={{
                  borderWidth: '2px',
                  borderRightWidth: '2px',
                  borderBottomWidth: '2px',
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
