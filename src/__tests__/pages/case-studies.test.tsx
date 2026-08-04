/**
 * Tests for Case Studies index page
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import CaseStudiesPage from '@/app/case-studies/page';

describe('Case Studies Index Page', () => {
  it('should render the page title', () => {
    render(<CaseStudiesPage />);
    expect(screen.getByText('Deep-Dive Technical Case Studies')).toBeInTheDocument();
  });

  it('should render the page description', () => {
    render(<CaseStudiesPage />);
    expect(
      screen.getByText(/Explore how I approach complex technical problems/i)
    ).toBeInTheDocument();
  });

  it('should render the technical-demo case study cards', () => {
    render(<CaseStudiesPage />);

    // Check for case study titles
    expect(screen.getByText('Real-Time Object Detection')).toBeInTheDocument();
    expect(screen.getByText('Multi-Model NLP Pipeline')).toBeInTheDocument();
    expect(screen.getByText('Multi-Source Data Pipeline')).toBeInTheDocument();
  });

  it('should render the marquee resume-win case study cards', () => {
    render(<CaseStudiesPage />);

    expect(screen.getByText('Agentic AI Workforce')).toBeInTheDocument();
    expect(screen.getByText('Real-Time IoT Data Platform')).toBeInTheDocument();
    expect(screen.getByText('ML Energy Forecasting')).toBeInTheDocument();
  });

  it('should render marquee categories and headline metrics', () => {
    render(<CaseStudiesPage />);

    expect(screen.getByText('AI & Agents')).toBeInTheDocument();
    expect(screen.getByText('Real-Time Systems')).toBeInTheDocument();
    expect(screen.getByText('Predictive Analytics')).toBeInTheDocument();

    // Headline metric values from the resume wins
    expect(screen.getByText('77%')).toBeInTheDocument();
    expect(screen.getByText('99.99%')).toBeInTheDocument();
    expect(screen.getByText('$2M')).toBeInTheDocument();
  });

  it('should link marquee cards to their detail pages', () => {
    render(<CaseStudiesPage />);

    expect(
      screen.getByRole('link', { name: /Agentic AI Workforce/i })
    ).toHaveAttribute('href', '/case-studies/agentic-ai-workforce');
    expect(
      screen.getByRole('link', { name: /Real-Time IoT Data Platform/i })
    ).toHaveAttribute('href', '/case-studies/realtime-iot-platform');
    expect(
      screen.getByRole('link', { name: /ML Energy Forecasting/i })
    ).toHaveAttribute('href', '/case-studies/energy-forecasting-ml');
  });

  it('should render case study subtitles', () => {
    render(<CaseStudiesPage />);

    expect(screen.getByText('Building a Multi-Model Computer Vision System')).toBeInTheDocument();
    expect(screen.getByText('Sentiment Analysis, NER, and Keyword Extraction')).toBeInTheDocument();
    expect(screen.getByText('Automated Ingestion, Processing, and Monitoring')).toBeInTheDocument();
  });

  it('should render category badges', () => {
    render(<CaseStudiesPage />);

    expect(screen.getByText('Computer Vision')).toBeInTheDocument();
    // Appears as both a category and a technology badge with the shared data.
    expect(screen.getAllByText('Machine Learning').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Data Engineering')).toBeInTheDocument();
  });

  it('should render technology badges for all case studies', () => {
    render(<CaseStudiesPage />);

    // Computer Vision case study techs
    expect(screen.getByText('YOLOv8')).toBeInTheDocument();
    expect(screen.getByText('TensorFlow.js')).toBeInTheDocument();

    // NLP case study techs
    expect(screen.getByText('spaCy')).toBeInTheDocument();
    expect(screen.getByText('DistilBERT')).toBeInTheDocument();

    // Data Pipeline case study techs (FastAPI/PostgreSQL appear across multiple case studies)
    expect(screen.getAllByText('FastAPI').length).toBeGreaterThan(0);
    expect(screen.getAllByText('PostgreSQL').length).toBeGreaterThan(0);
  });

  it('should render metrics for each case study', () => {
    render(<CaseStudiesPage />);

    // Check for some metric values
    expect(screen.getByText('~30 FPS')).toBeInTheDocument();
    expect(screen.getByText('1000 docs/min')).toBeInTheDocument();
    expect(screen.getByText('50K+')).toBeInTheDocument();
  });

  it('should render read time for each case study', () => {
    render(<CaseStudiesPage />);

    // Some read times are shared across cards (two 8-min reads, two 9-min reads)
    expect(screen.getAllByText('8 min read')).toHaveLength(2);
    expect(screen.getAllByText('9 min read')).toHaveLength(2);
    expect(screen.getByText('10 min read')).toBeInTheDocument();
    expect(screen.getByText('7 min read')).toBeInTheDocument();
  });

  it('should render "Read Case Study" CTAs', () => {
    render(<CaseStudiesPage />);

    const ctaButtons = screen.getAllByText('Read Case Study');
    expect(ctaButtons).toHaveLength(6);
  });

  it('should render links to individual case studies', () => {
    render(<CaseStudiesPage />);

    const computerVisionLink = screen.getByRole('link', { name: /Real-Time Object Detection/i });
    expect(computerVisionLink).toHaveAttribute('href', '/case-studies/computer-vision-object-detection');

    const nlpLink = screen.getByRole('link', { name: /Multi-Model NLP Pipeline/i });
    expect(nlpLink).toHaveAttribute('href', '/case-studies/nlp-pipeline-architecture');

    const pipelineLink = screen.getByRole('link', { name: /Multi-Source Data Pipeline/i });
    expect(pipelineLink).toHaveAttribute('href', '/case-studies/data-pipeline-orchestration');
  });

  it('should render the CTA section at the bottom', () => {
    render(<CaseStudiesPage />);

    expect(screen.getByText('Want to See More?')).toBeInTheDocument();
    expect(screen.getByText('View Live Demos')).toBeInTheDocument();
    expect(screen.getByText('Get in Touch')).toBeInTheDocument();
  });

  it('should render key feature icons in hero section', () => {
    render(<CaseStudiesPage />);

    expect(screen.getByText('Problem-Solving Approach')).toBeInTheDocument();
    expect(screen.getByText('Technical Decisions')).toBeInTheDocument();
    expect(screen.getByText('Lessons Learned')).toBeInTheDocument();
  });
});
