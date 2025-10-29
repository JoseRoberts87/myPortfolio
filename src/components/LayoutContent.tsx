'use client';

import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ErrorBoundary } from './ErrorBoundary';

export default function LayoutContent({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Header />
        <main className="flex-grow pt-16">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
        <Footer />
      </ErrorBoundary>
    </ThemeProvider>
  );
}
