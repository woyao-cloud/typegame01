import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white shadow-2xl border-4 border-sky-400 animate-bounce-in">
        <CardHeader className="flex flex-row items-center justify-between pb-4 sticky top-0 bg-white z-10">
          {title && (
            <CardTitle className="text-xl font-bold text-gray-800">
              {title}
            </CardTitle>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <span className="text-xl text-gray-500">×</span>
          </button>
        </CardHeader>
        <CardContent className="pt-0">{children}</CardContent>
        {footer && (
          <div className="px-6 pb-6 flex gap-3">{footer}</div>
        )}
      </Card>
    </div>
  );
};
