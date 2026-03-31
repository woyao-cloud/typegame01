import * as React from 'react';

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: string;
}

export interface AccordionProps {
  items: AccordionItem[];
  openItems?: string[];
  onOpenChange?: (openItems: string[]) => void;
  allowMultiple?: boolean;
  className?: string;
}

/**
 * 手风琴折叠组件 - 儿童友好风格
 */
export const Accordion: React.FC<AccordionProps> = ({
  items,
  openItems = [],
  onOpenChange,
  allowMultiple = false,
  className = '',
}) => {
  const [openState, setOpenState] = React.useState<string[]>(openItems);

  const isOpen = (id: string) => openState.includes(id);

  const toggle = (id: string) => {
    let newOpen;
    if (isOpen(id)) {
      newOpen = openState.filter((item) => item !== id);
    } else {
      newOpen = allowMultiple ? [...openState, id] : [id];
    }
    setOpenState(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item) => (
        <div
          key={item.id}
          className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white"
        >
          {/* 标题按钮 */}
          <button
            onClick={() => toggle(item.id)}
            className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {item.icon && <span className="text-xl">{item.icon}</span>}
              <span className="font-medium text-gray-800">{item.title}</span>
            </div>
            <span
              className={`
                text-gray-400 transition-transform duration-200
                spring-bounce
                ${isOpen(item.id) ? 'rotate-180' : ''}
              `}
            >
              ▼
            </span>
          </button>

          {/* 内容区域 */}
          <div
            className={`
              overflow-hidden transition-all duration-300
              ${isOpen(item.id) ? 'max-h-96' : 'max-h-0'}
            `}
          >
            <div className="px-4 py-3 bg-gray-50 text-sm text-gray-600">
              {item.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
