'use client';

import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function LayoutContent({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <Header />
      <main className="flex-grow pt-16">
        {children}
      </main>
      <Footer />
    </ThemeProvider>
  );
}
