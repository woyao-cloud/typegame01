import * as React from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '头像',
  size = 'md',
  fallback = '👤',
  className = '',
}) => {
  const [hasError, setHasError] = React.useState(false);

  const sizeStyles = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-full bg-sky-100 border-2 border-sky-300 ${sizeStyles[size]} ${className}`}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="text-gray-500">{fallback}</span>
      )}
    </div>
  );
};
