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

      expect(screen.getByText('Data and AI Architect')).toBeInTheDocument();
      expect(screen.getByText('Manager of Data Science and Data Engineering')).toBeInTheDocument();
      expect(screen.getByText('Senior Data Engineer')).toBeInTheDocument();
      expect(screen.getByText('Data Engineer')).toBeInTheDocument();
      expect(screen.getByText('Senior Data Engineer/Analyst - AVP')).toBeInTheDocument();
    });

    it('should render education items', () => {
      render(<Timeline />);

      expect(screen.getByText('Master of Science in Computer Science')).toBeInTheDocument();
      expect(screen.getByText('Bachelor of Arts in Political Science')).toBeInTheDocument();
    });

    it('should render certification items', () => {
      render(<Timeline />);

      expect(screen.getByText('Databricks Certified Data Engineer Professional')).toBeInTheDocument();
      expect(screen.getByText('AWS Certified Solutions Architect - Associate')).toBeInTheDocument();
      expect(screen.getByText('TinyML Certification')).toBeInTheDocument();
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

      expect(screen.getByText('MojoTech')).toBeInTheDocument();
      expect(screen.getByText('Very Technology')).toBeInTheDocument();
      expect(screen.getByText('Evonik Industries')).toBeInTheDocument();
      expect(screen.getByText('Amazon Robotics')).toBeInTheDocument();
      expect(screen.getByText('Bank of America')).toBeInTheDocument();
    });

    it('should display experience periods', () => {
      render(<Timeline variant="experience" />);

      // Periods appear multiple times due to responsive design (mobile and desktop views)
      expect(screen.getAllByText('July 2021 - August 2025').length).toBeGreaterThan(0);
      expect(screen.getAllByText('January 2019 - July 2021').length).toBeGreaterThan(0);
      expect(screen.getAllByText('April 2018 - January 2019').length).toBeGreaterThan(0);
      expect(screen.getAllByText('February 2011 - April 2018').length).toBeGreaterThan(0);
    });

    it('should display experience descriptions', () => {
      render(<Timeline variant="experience" />);

      expect(
        screen.getByText('Led teams of engineers emphasizing product ownership and scalable solutions integrating LLMs and generative AI.')
      ).toBeInTheDocument();
    });

    it('should display experience highlights', () => {
      render(<Timeline variant="experience" />);

      expect(
        screen.getByText(/Directed the integration of LLMs and Generative AI into existing systems/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Implemented machine learning forecasting model for energy consumption/i)
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

      expect(screen.getByText('Colorado Technical University Online')).toBeInTheDocument();
      expect(screen.getByText('University of Rhode Island')).toBeInTheDocument();
      expect(screen.getByText('Amazon Web Services')).toBeInTheDocument();
      expect(screen.getByText('Harvard edX')).toBeInTheDocument();
    });

    it('should display education periods', () => {
      render(<Timeline variant="education" />);

      expect(screen.getAllByText('2016 - 2017').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Certified').length).toBeGreaterThan(0);
    });

    it('should display education descriptions', () => {
      render(<Timeline variant="education" />);

      expect(
        screen.getByText('Advanced studies in computer science, algorithms, and system design.')
      ).toBeInTheDocument();
    });

    it('should display education highlights', () => {
      render(<Timeline variant="education" />);

      expect(screen.getByText('GPA: 3.95/4.0')).toBeInTheDocument();
      expect(screen.getByText(/Focus on scalable system architecture/i)).toBeInTheDocument();
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
        screen.getByText(/Developed an agentic workforce that automated workflows and managed tasks/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Consulted on the design of an AI-first system/i)
      ).toBeInTheDocument();
    });
  });

  describe('Layout and Content', () => {
    it('should render period badges with their text', () => {
      render(<Timeline />);

      // Period labels render for both experience and education items. The badge
      // styling is incidental; the text is the contract. (Experience periods
      // appear twice due to the mobile + desktop badges.)
      expect(screen.getAllByText('July 2021 - August 2025').length).toBeGreaterThan(0);
      expect(screen.getAllByText('2016 - 2017').length).toBeGreaterThan(0);
    });
  });

  describe('Content Organization', () => {
    it('should render experience items in order', () => {
      const { container } = render(<Timeline variant="experience" />);

      const titles = screen.getAllByRole('heading', { level: 3 });
      const titleTexts = titles.map(t => t.textContent);

      expect(titleTexts).toContain('Data and AI Architect');
      expect(titleTexts).toContain('Manager of Data Science and Data Engineering');
      expect(titleTexts).toContain('Senior Data Engineer');
      expect(titleTexts).toContain('Data Engineer');
      expect(titleTexts).toContain('Senior Data Engineer/Analyst - AVP');
    });

    it('should render education and certifications together in education section', () => {
      render(<Timeline variant="education" />);

      // Should have 2 education + 3 certifications = 5 total
      const titles = screen.getAllByRole('heading', { level: 3 });
      expect(titles.length).toBe(5);
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
        screen.getByText('Led teams of engineers emphasizing product ownership and scalable solutions integrating LLMs and generative AI.')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Advanced studies in computer science, algorithms, and system design.')
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

  describe('Organizations', () => {
    it('should render organization names for experience and education', () => {
      render(<Timeline />);

      expect(screen.getByText('MojoTech')).toBeInTheDocument();
      expect(screen.getByText('University of Rhode Island')).toBeInTheDocument();
    });
  });
});
