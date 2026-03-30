import * as React from 'react';

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
  return <div className="relative inline-block text-left">{children}</div>;
};

export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({
  children,
}) => {
  return <>{children}</>;
};

export const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({
  className = '',
  children,
}) => {
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
  return (
    <div
      className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-sky-50 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
