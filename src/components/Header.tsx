'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

const WORK_ITEMS = [
  { name: 'Web Development', href: '/web-dev' },
  { name: 'Data Pipelines', href: '/data-pipelines' },
  { name: 'Analytics', href: '/analytics' },
  { name: 'Machine Learning', href: '/machine-learning' },
  { name: 'Computer Vision', href: '/computer-vision' },
  { name: 'Signal Processing', href: '/signal-processing' },
  { name: 'Cloud & DevOps', href: '/cloud-devops' },
  { name: 'Case Studies', href: '/case-studies' },
  { name: 'GitHub', href: '/github' },
];

const PRIMARY_LINKS = [
  { name: 'AI Chat', href: '/ai-agents' },
  { name: 'About', href: '/about' },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [workOpen, setWorkOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const workRef = useRef<HTMLDivElement>(null);

  // Scroll-aware background/shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus when the route changes
  useEffect(() => {
    setMobileOpen(false);
    setWorkOpen(false);
  }, [pathname]);

  // Close the Work dropdown on outside click or Escape
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (workRef.current && !workRef.current.contains(e.target as Node)) setWorkOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setWorkOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const isActive = (href: string) => {
    if (href.includes('#')) return false; // anchor links aren't a "current page"
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };
  const workActive = WORK_ITEMS.some((item) => isActive(item.href));

  const desktopLinkClass = (active: boolean) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      active
        ? 'text-accent bg-purple-50 dark:bg-purple-500/10'
        : 'text-body hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
    }`;

  const mobileLinkClass = (active: boolean) =>
    `block px-3 py-2 rounded-md text-base font-medium transition-colors ${
      active
        ? 'text-accent bg-purple-50 dark:bg-purple-500/10'
        : 'text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
    }`;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-lg border-b border-slate-200 dark:border-slate-800'
          : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link
            href="/"
            className="text-xl font-bold text-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex-shrink-0"
          >
            Jose Roberts
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-1">
            {/* Work dropdown */}
            <div className="relative" ref={workRef}>
              <button
                type="button"
                onClick={() => setWorkOpen((open) => !open)}
                aria-expanded={workOpen}
                aria-haspopup="true"
                className={`${desktopLinkClass(workActive)} inline-flex items-center gap-1`}
              >
                Work
                <svg
                  className={`w-4 h-4 transition-transform ${workOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {workOpen && (
                <div className="absolute left-0 mt-2 w-56 rounded-lg bg-surface border border-subtle shadow-xl py-2">
                  {WORK_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive(item.href) ? 'page' : undefined}
                      className={`block px-4 py-2 text-sm transition-colors ${
                        isActive(item.href)
                          ? 'text-accent bg-purple-50 dark:bg-purple-500/10'
                          : 'text-body hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {PRIMARY_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={desktopLinkClass(isActive(item.href))}
              >
                {item.name}
              </Link>
            ))}

            {/* CTA */}
            <Link
              href="/#contact"
              className="ml-2 inline-flex items-center bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              Let&apos;s talk
            </Link>

            <div className="ml-1">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-expanded={mobileOpen}
              aria-label="Toggle navigation menu"
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
            >
              <svg
                className={`${mobileOpen ? 'hidden' : 'block'} h-6 w-6`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${mobileOpen ? 'block' : 'hidden'} h-6 w-6`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-surface-alt border-t border-slate-200 dark:border-slate-800 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-4 pt-3 pb-4 space-y-1">
            {PRIMARY_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={mobileLinkClass(isActive(item.href))}
              >
                {item.name}
              </Link>
            ))}

            <p className="px-3 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-faint">
              Work
            </p>
            {WORK_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={mobileLinkClass(isActive(item.href))}
              >
                {item.name}
              </Link>
            ))}

            <Link
              href="/#contact"
              className="mt-4 block text-center bg-purple-600 hover:bg-purple-500 text-white font-semibold px-4 py-3 rounded-lg transition-colors"
            >
              Let&apos;s talk
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
