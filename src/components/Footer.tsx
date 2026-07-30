import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    sections: [
      { name: 'Web Development', href: '/web-dev' },
      { name: 'Data Pipelines', href: '/data-pipelines' },
      { name: 'Analytics', href: '/analytics' },
      { name: 'Machine Learning', href: '/machine-learning' },
      { name: 'Computer Vision', href: '/computer-vision' },
      { name: 'Signal Processing', href: '/signal-processing' },
      { name: 'Cloud & DevOps', href: '/cloud-devops' },
    ],
    social: [
      { name: 'GitHub', href: 'https://github.com/JoseRoberts87', icon: 'github' },
      { name: 'LinkedIn', href: 'https://www.linkedin.com/in/jose-roberts', icon: 'linkedin' },
    ],
  };

  return (
    <footer className="bg-surface-alt border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-foreground">Portfolio</h3>
            <p className="text-slate-600 dark:text-gray-400 text-sm">
              Showcasing expertise in web development, data engineering, machine learning, and cloud infrastructure.
            </p>
            <div className="flex space-x-4">
              {footerLinks.social.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  aria-label={social.name}
                >
                  {social.icon === 'github' && (
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  )}
                  {social.icon === 'linkedin' && (
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  )}
                </a>
              ))}
            </div>

            {/* Location & availability */}
            <div className="space-y-2 pt-2">
              <p className="flex items-center gap-2 text-slate-600 dark:text-gray-400 text-sm">
                <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Providence, RI
              </p>
              <p className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
                <span className="relative flex h-2.5 w-2.5 flex-shrink-0" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
                </span>
                Open to Data &amp; AI Architect roles
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Expertise Areas</h4>
            <ul className="space-y-2">
              {footerLinks.sections.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/case-studies" className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-sm transition-colors">
                  Case Studies
                </Link>
              </li>
              <li>
                <Link href="/github" className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-sm transition-colors">
                  GitHub Activity
                </Link>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/jose-roberts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-sm transition-colors"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <Link href="/#contact" className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-sm transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/#resume" className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-sm transition-colors">
                  Resume
                </Link>
              </li>
            </ul>
            <div className="pt-4">
              <p className="text-slate-500 dark:text-gray-500 text-xs">
                Built with Next.js, React, TypeScript, and Tailwind CSS
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
          <p className="text-center text-slate-500 dark:text-gray-500 text-sm">
            &copy; {currentYear} Portfolio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
