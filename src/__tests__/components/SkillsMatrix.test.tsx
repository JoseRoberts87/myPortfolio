import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SkillsMatrix from '@/components/SkillsMatrix';

// Mock Recharts components since they require canvas/DOM
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  RadarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="radar-chart">{children}</div>
  ),
  Radar: () => <div data-testid="radar" />,
  PolarGrid: () => <div data-testid="polar-grid" />,
  PolarAngleAxis: () => <div data-testid="polar-angle-axis" />,
  PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

describe('SkillsMatrix Component', () => {
  it('should render the component with title and description', () => {
    render(<SkillsMatrix />);

    expect(screen.getByText('Skills Matrix')).toBeInTheDocument();
    expect(
      screen.getByText(/Comprehensive overview of technical expertise/i)
    ).toBeInTheDocument();
  });

  it('should render the radar chart', () => {
    render(<SkillsMatrix />);

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('radar')).toBeInTheDocument();
  });

  it('should display all 7 skill domains', () => {
    render(<SkillsMatrix />);

    expect(screen.getByText('Web Development')).toBeInTheDocument();
    expect(screen.getByText('Cloud & DevOps')).toBeInTheDocument();
    expect(screen.getByText('Data Pipelines')).toBeInTheDocument();
    expect(screen.getByText('Data Analytics')).toBeInTheDocument();
    expect(screen.getByText('Machine Learning')).toBeInTheDocument();
    expect(screen.getByText('Computer Vision')).toBeInTheDocument();
    expect(screen.getByText('Signal Processing')).toBeInTheDocument();
  });

  it('should display proficiency percentages for each domain', () => {
    render(<SkillsMatrix />);

    expect(screen.getByText('95%')).toBeInTheDocument(); // Web Development
    expect(screen.getByText('90%')).toBeInTheDocument(); // Cloud & DevOps
    expect(screen.getByText('85%')).toBeInTheDocument(); // Data Pipelines
    expect(screen.getAllByText('80%')).toHaveLength(2); // Data Analytics & Computer Vision
    expect(screen.getAllByText('75%')).toHaveLength(2); // Machine Learning & Signal Processing
  });

  it('should have Domain Breakdown section', () => {
    render(<SkillsMatrix />);

    expect(screen.getByText('Domain Breakdown')).toBeInTheDocument();
  });

  it('should display summary statistics', () => {
    render(<SkillsMatrix />);

    // 7 technical domains
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('Technical Domains')).toBeInTheDocument();

    // Average proficiency (95+90+85+80+75+80+75)/7 = 82.86 ≈ 83%
    expect(screen.getByText('83%')).toBeInTheDocument();
    expect(screen.getByText('Average Proficiency')).toBeInTheDocument();

    // Technologies count
    expect(screen.getByText(/Technologies/i)).toBeInTheDocument();
  });

  it('should expand domain details when clicked', () => {
    render(<SkillsMatrix />);

    // Initially, descriptions should not be visible
    expect(
      screen.queryByText(/Full-stack web applications with modern frameworks/i)
    ).not.toBeInTheDocument();

    // Click on Web Development domain
    const webDevDomain = screen.getByText('Web Development').closest('.p-4');
    if (webDevDomain) {
      fireEvent.click(webDevDomain);
    }

    // Description should now be visible
    expect(
      screen.getByText(/Full-stack web applications with modern frameworks/i)
    ).toBeInTheDocument();
  });

  it('should display technologies when domain is expanded', () => {
    render(<SkillsMatrix />);

    // Click on Web Development domain
    const webDevDomain = screen.getByText('Web Development').closest('.p-4');
    if (webDevDomain) {
      fireEvent.click(webDevDomain);
    }

    // Technologies should be visible
    expect(screen.getByText('React 19')).toBeInTheDocument();
    expect(screen.getByText('Next.js 16')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Tailwind CSS')).toBeInTheDocument();
    expect(screen.getByText('Jest')).toBeInTheDocument();
  });

  it('should collapse domain when clicked again', () => {
    render(<SkillsMatrix />);

    // Click to expand
    const webDevDomain = screen.getByText('Web Development').closest('.p-4');
    if (webDevDomain) {
      fireEvent.click(webDevDomain);
    }

    // Verify expanded
    expect(
      screen.getByText(/Full-stack web applications with modern frameworks/i)
    ).toBeInTheDocument();

    // Click again to collapse
    if (webDevDomain) {
      fireEvent.click(webDevDomain);
    }

    // Description should be hidden again
    expect(
      screen.queryByText(/Full-stack web applications with modern frameworks/i)
    ).not.toBeInTheDocument();
  });

  it('should show only one expanded domain at a time', () => {
    render(<SkillsMatrix />);

    // Expand Web Development
    const webDevDomain = screen.getByText('Web Development').closest('.p-4');
    if (webDevDomain) {
      fireEvent.click(webDevDomain);
    }

    expect(
      screen.getByText(/Full-stack web applications with modern frameworks/i)
    ).toBeInTheDocument();

    // Click Cloud & DevOps - this should collapse Web Development
    const cloudDevOpsDomain = screen.getByText('Cloud & DevOps').closest('.p-4');
    if (cloudDevOpsDomain) {
      fireEvent.click(cloudDevOpsDomain);
    }

    // Web Development should be collapsed now
    expect(
      screen.queryByText(/Full-stack web applications with modern frameworks/i)
    ).not.toBeInTheDocument();
    // Cloud & DevOps should be expanded
    expect(
      screen.getByText(/Infrastructure as Code, containerization/i)
    ).toBeInTheDocument();
  });

  it('should highlight selected domain with purple border', () => {
    render(<SkillsMatrix />);

    const webDevDomain = screen.getByText('Web Development').closest('.p-4');
    expect(webDevDomain).not.toHaveClass('border-purple-500');

    // Click to select
    if (webDevDomain) {
      fireEvent.click(webDevDomain);
    }

    expect(webDevDomain).toHaveClass('border-purple-500');
  });

  it('should display progress bars for each domain', () => {
    const { container } = render(<SkillsMatrix />);

    // Check for progress bar containers
    const progressBars = container.querySelectorAll('.bg-gray-700.rounded-full');
    expect(progressBars.length).toBeGreaterThanOrEqual(7);
  });

  it('should display all Cloud & DevOps technologies when expanded', () => {
    render(<SkillsMatrix />);

    const cloudDomain = screen.getByText('Cloud & DevOps').closest('.p-4');
    if (cloudDomain) {
      fireEvent.click(cloudDomain);
    }

    expect(screen.getByText('AWS')).toBeInTheDocument();
    expect(screen.getByText('Terraform')).toBeInTheDocument();
    expect(screen.getByText('Docker')).toBeInTheDocument();
    expect(screen.getByText('ECS Fargate')).toBeInTheDocument();
    expect(screen.getByText('GitHub Actions')).toBeInTheDocument();
  });

  it('should display all Data Pipelines technologies when expanded', () => {
    render(<SkillsMatrix />);

    const dataPipelinesDomain = screen.getByText('Data Pipelines').closest('.p-4');
    if (dataPipelinesDomain) {
      fireEvent.click(dataPipelinesDomain);
    }

    expect(screen.getByText('FastAPI')).toBeInTheDocument();
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
    expect(screen.getByText('Redis')).toBeInTheDocument();
    expect(screen.getByText('ETL')).toBeInTheDocument();
    expect(screen.getByText('Alembic')).toBeInTheDocument();
  });

  it('should display all Machine Learning technologies when expanded', () => {
    render(<SkillsMatrix />);

    const mlDomain = screen.getByText('Machine Learning').closest('.p-4');
    if (mlDomain) {
      fireEvent.click(mlDomain);
    }

    expect(screen.getByText('Transformers.js')).toBeInTheDocument();
    expect(screen.getByText('DistilBERT')).toBeInTheDocument();
    expect(screen.getByText('NLP')).toBeInTheDocument();
    expect(screen.getByText('Sentiment Analysis')).toBeInTheDocument();
    expect(screen.getByText('Browser ML')).toBeInTheDocument();
  });

  it('should have correct structure with card component', () => {
    const { container } = render(<SkillsMatrix />);

    // Check for card styling
    const card = container.querySelector('.rounded-lg');
    expect(card).toBeInTheDocument();
  });

  it('should render responsive grid layout', () => {
    const { container } = render(<SkillsMatrix />);

    // Check for grid layout
    const grid = container.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2');
    expect(grid).toBeInTheDocument();
  });
});
