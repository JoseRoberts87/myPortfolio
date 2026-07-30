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

  // Text tone flips per theme so it clears WCAG AA against the tinted pill on
  // both light and dark backgrounds. The dark-only *-400 tones failed contrast
  // (~2:1) when the light theme rendered them over the light tint.
  const variantStyles = {
    primary: 'bg-purple-600/15 text-purple-700 dark:text-purple-300 border border-purple-500/30',
    secondary: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/40',
    success: 'bg-green-600/15 text-green-800 dark:text-green-300 border border-green-500/30',
    warning: 'bg-yellow-500/15 text-yellow-800 dark:text-yellow-300 border border-yellow-500/40',
    error: 'bg-red-600/15 text-red-700 dark:text-red-300 border border-red-500/30',
    info: 'bg-blue-600/15 text-blue-700 dark:text-blue-300 border border-blue-500/30',
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
