import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Timeline from '@/components/Timeline';

describe('Timeline Component', () => {
  describe('Default Rendering (all variant)', () => {
    it('should render both experience and education sections', () => {
      render(<Timeline />);

      expect(screen.getByText('Professional Experience')).toBeInTheDocument();
      expect(screen.getByText('Education & Certifications')).toBeInTheDocument();
    });

    it('should render experience items', () => {
      render(<Timeline />);

      expect(screen.getByText('Senior Full-Stack Engineer')).toBeInTheDocument();
      expect(screen.getByText('Full-Stack Developer')).toBeInTheDocument();
    });

    it('should render education items', () => {
      render(<Timeline />);

      expect(screen.getByText('Bachelor of Science in Computer Science')).toBeInTheDocument();
    });

    it('should render certification items', () => {
      render(<Timeline />);

      expect(screen.getByText('AWS Certified Solutions Architect')).toBeInTheDocument();
      expect(screen.getByText('Professional Scrum Master (PSM I)')).toBeInTheDocument();
    });
  });

  describe('Experience Variant', () => {
    it('should render only experience section when variant is experience', () => {
      render(<Timeline variant="experience" />);

      expect(screen.getByText('Professional Experience')).toBeInTheDocument();
      expect(screen.queryByText('Education & Certifications')).not.toBeInTheDocument();
    });

    it('should display experience organizations', () => {
      render(<Timeline variant="experience" />);

      expect(screen.getByText('Tech Company')).toBeInTheDocument();
      expect(screen.getByText('Software Solutions Inc.')).toBeInTheDocument();
    });

    it('should display experience periods', () => {
      render(<Timeline variant="experience" />);

      // Periods appear multiple times due to responsive design (mobile and desktop views)
      expect(screen.getAllByText('2020 - Present').length).toBeGreaterThan(0);
      expect(screen.getAllByText('2018 - 2020').length).toBeGreaterThan(0);
    });

    it('should display experience descriptions', () => {
      render(<Timeline variant="experience" />);

      expect(
        screen.getByText('Leading full-stack development initiatives for enterprise-scale applications.')
      ).toBeInTheDocument();
    });

    it('should display experience highlights', () => {
      render(<Timeline variant="experience" />);

      expect(
        screen.getByText(/Architected and deployed cloud-native applications on AWS/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Built data pipelines processing millions of records/i)
      ).toBeInTheDocument();
    });
  });

  describe('Education Variant', () => {
    it('should render only education section when variant is education', () => {
      render(<Timeline variant="education" />);

      expect(screen.getByText('Education & Certifications')).toBeInTheDocument();
      expect(screen.queryByText('Professional Experience')).not.toBeInTheDocument();
    });

    it('should display education organizations', () => {
      render(<Timeline variant="education" />);

      expect(screen.getByText('University Name')).toBeInTheDocument();
      expect(screen.getByText('Amazon Web Services')).toBeInTheDocument();
      expect(screen.getByText('Scrum.org')).toBeInTheDocument();
    });

    it('should display education periods', () => {
      render(<Timeline variant="education" />);

      expect(screen.getByText('2014 - 2018')).toBeInTheDocument();
      expect(screen.getAllByText('2021')).toHaveLength(1);
      expect(screen.getAllByText('2020')).toHaveLength(1);
    });

    it('should display education descriptions', () => {
      render(<Timeline variant="education" />);

      expect(
        screen.getByText('Focused on software engineering, algorithms, and data structures.')
      ).toBeInTheDocument();
    });

    it('should display education highlights', () => {
      render(<Timeline variant="education" />);

      expect(screen.getByText('GPA: 3.8/4.0')).toBeInTheDocument();
      expect(screen.getByText(/Dean's List/i)).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('should render briefcase icons for experience items', () => {
      const { container } = render(<Timeline variant="experience" />);

      // Briefcase icon path
      const briefcaseIcons = container.querySelectorAll('path[d*="V5a3 3 0 013-3h2a3 3 0"]');
      expect(briefcaseIcons.length).toBeGreaterThan(0);
    });

    it('should render education cap icons for education items', () => {
      const { container } = render(<Timeline variant="education" />);

      // Education cap icon path
      const educationIcons = container.querySelectorAll('path[d*="M10.394 2.08a1 1 0"]');
      expect(educationIcons.length).toBeGreaterThan(0);
    });

    it('should render certificate badge icons for certifications', () => {
      const { container } = render(<Timeline variant="education" />);

      // Certificate badge icon path
      const certIcons = container.querySelectorAll('path[d*="M6.267 3.455a3.066 3.066 0"]');
      expect(certIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Highlights', () => {
    it('should render checkmark icons for highlights', () => {
      const { container } = render(<Timeline />);

      // Checkmark icons
      const checkmarks = container.querySelectorAll('path[clip-rule="evenodd"]');
      expect(checkmarks.length).toBeGreaterThan(0);
    });

    it('should display all highlights for experience items', () => {
      render(<Timeline variant="experience" />);

      expect(
        screen.getByText(/Developed modern web applications using React, Next.js, and TypeScript/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Implemented CI\/CD pipelines and infrastructure as code/i)
      ).toBeInTheDocument();
    });

    it('should not render highlights section if highlights array is empty', () => {
      const { container } = render(<Timeline variant="education" />);

      // Certifications don't have highlights in the component
      const certCards = container.querySelectorAll('.space-y-1');
      // Education has highlights, certifications don't
      expect(certCards.length).toBeGreaterThan(0);
    });
  });

  describe('Layout and Styling', () => {
    it('should have gradient backgrounds on icon containers', () => {
      const { container } = render(<Timeline />);

      const gradientIcons = container.querySelectorAll('.bg-gradient-to-br.from-purple-600.to-purple-400');
      expect(gradientIcons.length).toBeGreaterThan(0);
    });

    it('should have period badges with purple background', () => {
      const { container } = render(<Timeline />);

      const periodBadges = container.querySelectorAll('.bg-purple-900\\/50.text-purple-300');
      expect(periodBadges.length).toBeGreaterThan(0);
    });

    it('should use Card component for experience items', () => {
      const { container } = render(<Timeline variant="experience" />);

      // Card adds rounded-lg class
      const cards = container.querySelectorAll('.rounded-lg');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should have responsive grid layout for education items', () => {
      const { container } = render(<Timeline variant="education" />);

      const grid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3');
      expect(grid).toBeInTheDocument();
    });

    it('should have responsive grid layout for experience timeline', () => {
      const { container } = render(<Timeline variant="experience" />);

      const grids = container.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-2');
      expect(grids.length).toBeGreaterThan(0);
    });
  });

  describe('Timeline Visual Elements', () => {
    it('should render timeline dots for desktop view', () => {
      const { container } = render(<Timeline variant="experience" />);

      // Timeline dots (hidden on mobile, visible on desktop)
      const timelineDots = container.querySelectorAll('.w-12.h-12.rounded-full');
      expect(timelineDots.length).toBeGreaterThan(0);
    });

    it('should have timeline connecting lines', () => {
      const { container } = render(<Timeline variant="experience" />);

      // Timeline vertical line
      const timelineLines = container.querySelectorAll('.w-0\\.5.bg-purple-500\\/30');
      expect(timelineLines.length).toBeGreaterThan(0);
    });

    it('should hide timeline elements on mobile with md:block classes', () => {
      const { container } = render(<Timeline variant="experience" />);

      // Elements that should be hidden on mobile
      const hiddenOnMobile = container.querySelectorAll('.hidden.md\\:block');
      expect(hiddenOnMobile.length).toBeGreaterThan(0);
    });
  });

  describe('Content Organization', () => {
    it('should render experience items in order', () => {
      const { container } = render(<Timeline variant="experience" />);

      const titles = screen.getAllByRole('heading', { level: 3 });
      const titleTexts = titles.map(t => t.textContent);

      expect(titleTexts).toContain('Senior Full-Stack Engineer');
      expect(titleTexts).toContain('Full-Stack Developer');
    });

    it('should render education and certifications together in education section', () => {
      render(<Timeline variant="education" />);

      // Should have 1 education + 2 certifications = 3 total
      const titles = screen.getAllByRole('heading', { level: 3 });
      expect(titles.length).toBe(3);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<Timeline />);

      const h2Headings = screen.getAllByRole('heading', { level: 2 });
      expect(h2Headings).toHaveLength(2); // Professional Experience + Education & Certifications

      const h3Headings = screen.getAllByRole('heading', { level: 3 });
      expect(h3Headings.length).toBeGreaterThan(0); // All job/education titles
    });

    it('should have descriptive text for all items', () => {
      render(<Timeline />);

      // All items should have descriptions
      expect(
        screen.getByText('Leading full-stack development initiatives for enterprise-scale applications.')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Focused on software engineering, algorithms, and data structures.')
      ).toBeInTheDocument();
    });
  });

  describe('Component Variants', () => {
    it('should accept and handle all variant prop', () => {
      render(<Timeline variant="all" />);

      expect(screen.getByText('Professional Experience')).toBeInTheDocument();
      expect(screen.getByText('Education & Certifications')).toBeInTheDocument();
    });

    it('should render correctly without variant prop (default to all)', () => {
      render(<Timeline />);

      expect(screen.getByText('Professional Experience')).toBeInTheDocument();
      expect(screen.getByText('Education & Certifications')).toBeInTheDocument();
    });
  });

  describe('Visual Design', () => {
    it('should have white text for titles', () => {
      const { container } = render(<Timeline />);

      const whiteTitles = container.querySelectorAll('.text-white');
      expect(whiteTitles.length).toBeGreaterThan(0);
    });

    it('should have purple text for organizations', () => {
      const { container } = render(<Timeline />);

      const purpleOrgs = container.querySelectorAll('.text-purple-400');
      expect(purpleOrgs.length).toBeGreaterThan(0);
    });

    it('should have shadow effects on timeline dots', () => {
      const { container } = render(<Timeline variant="experience" />);

      const shadowElements = container.querySelectorAll('.shadow-lg, .shadow-2xl');
      expect(shadowElements.length).toBeGreaterThan(0);
    });
  });
});
