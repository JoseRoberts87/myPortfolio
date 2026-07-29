import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  className = '',
  ...props
}: CardProps) {
  const baseStyles = 'rounded-lg transition-all duration-200';

  const variantStyles = {
    default: 'bg-white dark:bg-slate-800/50 border border-subtle',
    bordered: 'bg-transparent border-2 border-subtle',
    elevated: 'bg-surface shadow-lg shadow-slate-300/40 dark:shadow-purple-500/10',
  };

  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyle = hover ? 'hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer' : '';

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
