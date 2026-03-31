import * as React from 'react';

export interface CommandOption {
  value: string;
  label: string;
  icon?: string;
  shortcut?: string;
}

export interface CommandProps {
  options: CommandOption[];
  onSelect: (option: CommandOption) => void;
  placeholder?: string;
  className?: string;
}

/**
 * 命令面板组件 - 儿童友好风格
 */
export const Command: React.FC<CommandProps> = ({
  options,
  onSelect,
  placeholder = '搜索或输入命令...',
  className = '',
}) => {
  const [search, setSearch] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase()) ||
      opt.value.toLowerCase().includes(search.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      onSelect(filteredOptions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setSearch('');
      setSelectedIndex(-1);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* 搜索输入框 */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-10 text-base bg-white border-2 border-gray-300 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all spring-bounce"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
          ⌘K
        </span>
      </div>

      {/* 选项列表 */}
      {filteredOptions.length > 0 && (
        <div className="mt-2 bg-white border-2 border-sky-200 rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto">
          {filteredOptions.map((option, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={option.value}
                onClick={() => onSelect(option)}
                className={`
                  w-full px-4 py-3 flex items-center justify-between
                  transition-colors duration-150
                  ${isSelected
                    ? 'bg-sky-50 text-sky-600'
                    : 'hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  {option.icon && <span className="text-lg">{option.icon}</span>}
                  <span className="font-medium">{option.label}</span>
                </div>
                {option.shortcut && (
                  <kbd className="px-2 py-1 text-xs bg-gray-100 rounded-md text-gray-500">
                    {option.shortcut}
                  </kbd>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 空状态 */}
      {search && filteredOptions.length === 0 && (
        <div className="mt-2 p-4 text-center text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          没有找到匹配的结果
        </div>
      )}
    </div>
  );
};
