import * as React from 'react';

interface DropdownMenuContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  closeMenu: () => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextType | undefined>(undefined);

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

interface DropdownMenuContentProps {
  className?: string;
  children: React.ReactNode;
}

interface DropdownMenuItemProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const closeMenu = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen, closeMenu }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  );
};

export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({
  children,
  asChild,
}) => {
  const context = React.useContext(DropdownMenuContext);

  if (!context) {
    throw new Error('DropdownMenuTrigger must be used within DropdownMenu');
  }

  const { isOpen, setIsOpen } = context;

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  if (asChild) {
    // 如果是 asChild 模式，克隆子元素并添加 onClick
    const child = React.Children.only(children as React.ReactElement);
    return React.cloneElement(child, {
      onClick: handleClick,
    } as any);
  }

  return (
    <div onClick={handleClick} className="cursor-pointer">
      {children}
    </div>
  );
};

export const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({
  className = '',
  children,
}) => {
  const context = React.useContext(DropdownMenuContext);

  if (!context) {
    throw new Error('DropdownMenuContent must be used within DropdownMenu');
  }

  const { isOpen } = context;

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={`absolute z-50 mt-2 w-full min-w-[8rem] overflow-hidden rounded-md border bg-white shadow-lg ${className}`}
    >
      <div className="p-1">{children}</div>
    </div>
  );
};

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  className = '',
  children,
  onClick,
}) => {
  const context = React.useContext(DropdownMenuContext);

  if (!context) {
    throw new Error('DropdownMenuItem must be used within DropdownMenu');
  }

  const { closeMenu } = context;

  const handleClick = (e: React.MouseEvent) => {
    onClick?.();
    closeMenu();
  };

  return (
    <div
      className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-sky-50 ${className}`}
      onClick={handleClick}
    >
      {children}
    </div>
  );
};
