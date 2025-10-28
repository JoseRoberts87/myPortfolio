import { HTMLAttributes, ReactNode } from 'react';
import Container from './Container';

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  background?: 'transparent' | 'subtle' | 'dark';
}

export default function Section({
  children,
  containerSize = 'lg',
  padding = 'lg',
  background = 'transparent',
  className = '',
  ...props
}: SectionProps) {
  const paddingStyles = {
    none: '',
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
    xl: 'py-24',
  };

  const backgroundStyles = {
    transparent: '',
    subtle: 'bg-slate-900/50',
    dark: 'bg-slate-900',
  };

  return (
    <section
      className={`${paddingStyles[padding]} ${backgroundStyles[background]} ${className}`}
      {...props}
    >
      <Container size={containerSize}>
        {children}
      </Container>
    </section>
  );
}
