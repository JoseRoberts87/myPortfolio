import { HTMLAttributes, ReactNode } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

export default function Badge({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full';

  const variantStyles = {
    primary: 'bg-purple-600/20 text-purple-400 border border-purple-500/30',
    secondary: 'bg-slate-700/50 text-slate-300 border border-slate-600',
    success: 'bg-green-600/20 text-green-400 border border-green-500/30',
    warning: 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30',
    error: 'bg-red-600/20 text-red-400 border border-red-500/30',
    info: 'bg-blue-600/20 text-blue-400 border border-blue-500/30',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
