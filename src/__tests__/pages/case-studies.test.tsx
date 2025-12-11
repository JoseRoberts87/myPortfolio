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

  it('should render all three case study cards', () => {
    render(<CaseStudiesPage />);

    // Check for case study titles
    expect(screen.getByText('Real-Time Object Detection')).toBeInTheDocument();
    expect(screen.getByText('Multi-Model NLP Pipeline')).toBeInTheDocument();
    expect(screen.getByText('Multi-Source Data Pipeline')).toBeInTheDocument();
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
    expect(screen.getByText('Machine Learning')).toBeInTheDocument();
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

    // Data Pipeline case study techs
    expect(screen.getByText('FastAPI')).toBeInTheDocument();
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
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

    expect(screen.getByText('8 min read')).toBeInTheDocument();
    expect(screen.getByText('10 min read')).toBeInTheDocument();
    expect(screen.getByText('9 min read')).toBeInTheDocument();
  });

  it('should render "Read Case Study" CTAs', () => {
    render(<CaseStudiesPage />);

    const ctaButtons = screen.getAllByText('Read Case Study');
    expect(ctaButtons).toHaveLength(3);
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
