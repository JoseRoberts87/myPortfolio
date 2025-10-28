import { HTMLAttributes, ReactNode } from 'react';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export default function Container({
  children,
  size = 'lg',
  className = '',
  ...props
}: ContainerProps) {
  const baseStyles = 'mx-auto px-4 sm:px-6 lg:px-8';

  const sizeStyles = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    xl: 'max-w-[1400px]',
    full: 'max-w-full',
  };

  return (
    <div
      className={`${baseStyles} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
