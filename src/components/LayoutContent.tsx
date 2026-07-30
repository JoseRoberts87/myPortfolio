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
        {/* Skip link: first focusable element, visually hidden until focused,
            lets keyboard/screen-reader users bypass the nav (WCAG 2.4.1). */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-purple-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:outline-none focus:ring-2 focus:ring-purple-300"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main-content" tabIndex={-1} className="flex-grow pt-16 focus:outline-none">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
        <Footer />
      </ErrorBoundary>
    </ThemeProvider>
  );
}
