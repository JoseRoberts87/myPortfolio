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

  it('should display all 8 skill domains', () => {
    render(<SkillsMatrix />);

    expect(screen.getByText('AI / LLMs / Agents')).toBeInTheDocument();
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

    expect(screen.getByText('92%')).toBeInTheDocument(); // AI / LLMs / Agents
    expect(screen.getByText('95%')).toBeInTheDocument(); // Web Development
    expect(screen.getByText('90%')).toBeInTheDocument(); // Cloud & DevOps
    expect(screen.getByText('88%')).toBeInTheDocument(); // Data Pipelines
    expect(screen.getByText('82%')).toBeInTheDocument(); // Data Analytics
    expect(screen.getByText('78%')).toBeInTheDocument(); // Machine Learning
    expect(screen.getByText('80%')).toBeInTheDocument(); // Computer Vision
    expect(screen.getByText('75%')).toBeInTheDocument(); // Signal Processing
  });

  it('should have Domain Breakdown section', () => {
    render(<SkillsMatrix />);

    expect(screen.getByText('Domain Breakdown')).toBeInTheDocument();
  });

  it('should display summary statistics', () => {
    render(<SkillsMatrix />);

    // 8 technical domains
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('Technical Domains')).toBeInTheDocument();

    // Average proficiency (92+95+90+88+82+78+80+75)/8 = 85%
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('Average Proficiency')).toBeInTheDocument();

    // Technologies count
    expect(screen.getByText(/Technologies/i)).toBeInTheDocument();
  });

  it('should expand domain details when clicked', () => {
    render(<SkillsMatrix />);

    // Initially, descriptions should not be visible
    expect(
      screen.queryByText(/Full-stack applications/i)
    ).not.toBeInTheDocument();

    // Click on the Web Development domain (the whole row is the click target)
    fireEvent.click(screen.getByText('Web Development'));

    // Description should now be visible
    expect(
      screen.getByText(/Full-stack applications/i)
    ).toBeInTheDocument();
  });

  it('should display technologies when domain is expanded', () => {
    render(<SkillsMatrix />);

    // Click on the Web Development domain
    fireEvent.click(screen.getByText('Web Development'));

    // Technologies should be visible
    expect(screen.getByText('React 19')).toBeInTheDocument();
    expect(screen.getByText('Next.js 16')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Java / Spring Boot')).toBeInTheDocument();
    expect(screen.getByText('Flask / Django')).toBeInTheDocument();
    expect(screen.getByText('Jest')).toBeInTheDocument();
  });

  it('should collapse domain when clicked again', () => {
    render(<SkillsMatrix />);

    // Click to expand
    fireEvent.click(screen.getByText('Web Development'));

    // Verify expanded
    expect(
      screen.getByText(/Full-stack applications/i)
    ).toBeInTheDocument();

    // Click again to collapse
    fireEvent.click(screen.getByText('Web Development'));

    // Description should be hidden again
    expect(
      screen.queryByText(/Full-stack applications/i)
    ).not.toBeInTheDocument();
  });

  it('should show only one expanded domain at a time', () => {
    render(<SkillsMatrix />);

    // Expand Web Development
    fireEvent.click(screen.getByText('Web Development'));

    expect(
      screen.getByText(/Full-stack applications/i)
    ).toBeInTheDocument();

    // Click Cloud & DevOps - this should collapse Web Development
    fireEvent.click(screen.getByText('Cloud & DevOps'));

    // Web Development should be collapsed now
    expect(
      screen.queryByText(/Full-stack applications/i)
    ).not.toBeInTheDocument();
    // Cloud & DevOps should be expanded
    expect(
      screen.getByText(/Infrastructure as Code, containerization/i)
    ).toBeInTheDocument();
  });

  it('should render a breakdown row for each of the 8 domains', () => {
    render(<SkillsMatrix />);

    // Each domain renders as a level-4 heading in the breakdown list; assert the
    // count of rows rather than counting styled progress-bar elements.
    expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(8);
  });

  it('should display all Cloud & DevOps technologies when expanded', () => {
    render(<SkillsMatrix />);

    fireEvent.click(screen.getByText('Cloud & DevOps'));

    expect(screen.getByText('AWS')).toBeInTheDocument();
    expect(screen.getByText('Azure')).toBeInTheDocument();
    expect(screen.getByText('GCP')).toBeInTheDocument();
    expect(screen.getByText('Terraform')).toBeInTheDocument();
    expect(screen.getByText('Docker')).toBeInTheDocument();
    expect(screen.getByText('Kubernetes')).toBeInTheDocument();
    expect(screen.getByText('GitHub Actions')).toBeInTheDocument();
  });

  it('should display all Data Pipelines technologies when expanded', () => {
    render(<SkillsMatrix />);

    fireEvent.click(screen.getByText('Data Pipelines'));

    expect(screen.getByText('Databricks')).toBeInTheDocument();
    expect(screen.getByText('FastAPI')).toBeInTheDocument();
    expect(screen.getByText('Kinesis')).toBeInTheDocument();
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
    expect(screen.getByText('MongoDB')).toBeInTheDocument();
    expect(screen.getByText('ETL')).toBeInTheDocument();
  });

  it('should display the new AI / LLMs / Agents domain and its technologies', () => {
    render(<SkillsMatrix />);

    const aiDomain = screen.getByText('AI / LLMs / Agents');
    expect(aiDomain).toBeInTheDocument();
    fireEvent.click(aiDomain);

    expect(screen.getByText('OpenAI')).toBeInTheDocument();
    expect(screen.getByText('RAG')).toBeInTheDocument();
    expect(screen.getByText('AI Agents')).toBeInTheDocument();
    expect(screen.getByText('Agentic Workflows')).toBeInTheDocument();
  });

  it('should display all Machine Learning technologies when expanded', () => {
    render(<SkillsMatrix />);

    fireEvent.click(screen.getByText('Machine Learning'));

    expect(screen.getByText('Transformers.js')).toBeInTheDocument();
    expect(screen.getByText('DistilBERT')).toBeInTheDocument();
    expect(screen.getByText('NLP')).toBeInTheDocument();
    expect(screen.getByText('Sentiment Analysis')).toBeInTheDocument();
    expect(screen.getByText('Browser ML')).toBeInTheDocument();
  });

});
