/**
 * Tests for Case Study detail page
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import CaseStudyPage from '@/app/case-studies/[slug]/page';

// Mock notFound
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

describe('Case Study Detail Page', () => {
  describe('Computer Vision Case Study', () => {
    it('should render the case study title', async () => {
      const params = Promise.resolve({ slug: 'computer-vision-object-detection' });
      const component = await CaseStudyPage({ params });
      render(component);

      expect(screen.getByText('Real-Time Object Detection')).toBeInTheDocument();
    });

    it('should render the case study subtitle', async () => {
      const params = Promise.resolve({ slug: 'computer-vision-object-detection' });
      const component = await CaseStudyPage({ params });
      render(component);

      expect(screen.getByText('Building a Multi-Model Computer Vision System')).toBeInTheDocument();
    });

    it('should render the challenge statement', async () => {
      const params = Promise.resolve({ slug: 'computer-vision-object-detection' });
      const component = await CaseStudyPage({ params });
      render(component);

      expect(screen.getByText('The Challenge')).toBeInTheDocument();
      expect(
        screen.getByText(/Build a production-ready object detection system/i)
      ).toBeInTheDocument();
    });

    it('should render key metrics', async () => {
      const params = Promise.resolve({ slug: 'computer-vision-object-detection' });
      const component = await CaseStudyPage({ params });
      render(component);

      expect(screen.getByText('Key Metrics')).toBeInTheDocument();
      expect(screen.getByText('~30 FPS')).toBeInTheDocument();
      expect(screen.getByText('6.2 MB')).toBeInTheDocument();
    });

    it('should render technology badges', async () => {
      const params = Promise.resolve({ slug: 'computer-vision-object-detection' });
      const component = await CaseStudyPage({ params });
      render(component);

      expect(screen.getByText('Technologies Used')).toBeInTheDocument();
      expect(screen.getByText('YOLOv8')).toBeInTheDocument();
      expect(screen.getByText('TensorFlow.js')).toBeInTheDocument();
      expect(screen.getByText('React 19')).toBeInTheDocument();
    });

    it('should render main content sections', async () => {
      const params = Promise.resolve({ slug: 'computer-vision-object-detection' });
      const component = await CaseStudyPage({ params });
      render(component);

      expect(screen.getByText('The Problem')).toBeInTheDocument();
      expect(screen.getByText('Technical Challenges')).toBeInTheDocument();
      expect(screen.getByText('Solution Architecture')).toBeInTheDocument();
      expect(screen.getByText('Key Implementation Details')).toBeInTheDocument();
      expect(screen.getByText('Results & Impact')).toBeInTheDocument();
      expect(screen.getByText('Trade-offs & Architecture Decisions')).toBeInTheDocument();
      expect(screen.getByText('Lessons Learned')).toBeInTheDocument();
    });

    it('should render live demo link', async () => {
      const params = Promise.resolve({ slug: 'computer-vision-object-detection' });
      const component = await CaseStudyPage({ params });
      render(component);

      expect(screen.getByText('See It In Action')).toBeInTheDocument();
      const demoLink = screen.getByRole('link', { name: /View Live Demo/i });
      expect(demoLink).toHaveAttribute('href', '/computer-vision');
    });

    it('should render related case studies section', async () => {
      const params = Promise.resolve({ slug: 'computer-vision-object-detection' });
      const component = await CaseStudyPage({ params });
      render(component);

      expect(screen.getByText('Related Case Studies')).toBeInTheDocument();
    });

    it('should render breadcrumb navigation', async () => {
      const params = Promise.resolve({ slug: 'computer-vision-object-detection' });
      const component = await CaseStudyPage({ params });
      render(component);

      const backLink = screen.getByRole('link', { name: /Back to Case Studies/i });
      expect(backLink).toHaveAttribute('href', '/case-studies');
    });
  });

  describe('NLP Pipeline Case Study', () => {
    it('should render the case study title', async () => {
      const params = Promise.resolve({ slug: 'nlp-pipeline-architecture' });
      const component = await CaseStudyPage({ params });
      render(component);

      expect(screen.getByText('Multi-Model NLP Pipeline')).toBeInTheDocument();
    });

    it('should render key metrics', async () => {
      const params = Promise.resolve({ slug: 'nlp-pipeline-architecture' });
      const component = await CaseStudyPage({ params });
      render(component);

      expect(screen.getByText('1000 docs/min')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('0.91')).toBeInTheDocument();
    });

    it('should render technology badges', async () => {
      const params = Promise.resolve({ slug: 'nlp-pipeline-architecture' });
      const component = await CaseStudyPage({ params });
      render(component);

      expect(screen.getByText('spaCy')).toBeInTheDocument();
      expect(screen.getByText('DistilBERT')).toBeInTheDocument();
      expect(screen.getByText('TF-IDF')).toBeInTheDocument();
    });
  });

  describe('Data Pipeline Case Study', () => {
    it('should render the case study title', async () => {
      const params = Promise.resolve({ slug: 'data-pipeline-orchestration' });
      const component = await CaseStudyPage({ params });
      render(component);

      expect(screen.getByText('Multi-Source Data Pipeline')).toBeInTheDocument();
    });

    it('should render key metrics', async () => {
      const params = Promise.resolve({ slug: 'data-pipeline-orchestration' });
      const component = await CaseStudyPage({ params });
      render(component);

      expect(screen.getByText('50K+')).toBeInTheDocument();
      expect(screen.getByText('99.8%')).toBeInTheDocument();
    });

    it('should render technology badges', async () => {
      const params = Promise.resolve({ slug: 'data-pipeline-orchestration' });
      const component = await CaseStudyPage({ params });
      render(component);

      expect(screen.getByText('FastAPI')).toBeInTheDocument();
      expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
      expect(screen.getByText('Redis')).toBeInTheDocument();
      expect(screen.getByText('APScheduler')).toBeInTheDocument();
    });
  });

  describe('Invalid case study', () => {
    it('should call notFound for invalid slug', async () => {
      const { notFound } = require('next/navigation');
      const params = Promise.resolve({ slug: 'non-existent-case-study' });

      await CaseStudyPage({ params });

      expect(notFound).toHaveBeenCalled();
    });
  });

  describe('Static params generation', () => {
    it('should generate static params for all case studies', async () => {
      const { generateStaticParams } = require('@/app/case-studies/[slug]/page');

      const params = await generateStaticParams();

      expect(params).toEqual([
        { slug: 'computer-vision-object-detection' },
        { slug: 'nlp-pipeline-architecture' },
        { slug: 'data-pipeline-orchestration' },
      ]);
    });
  });
});
