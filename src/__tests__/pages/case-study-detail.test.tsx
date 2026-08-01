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

      expect(screen.getByText('Executive Summary')).toBeInTheDocument();
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

  describe('Agentic AI Workforce Case Study', () => {
    const slug = 'agentic-ai-workforce';

    it('should render title, subtitle, and challenge', async () => {
      const component = await CaseStudyPage({ params: Promise.resolve({ slug }) });
      render(component);

      expect(screen.getByText('Agentic AI Workforce')).toBeInTheDocument();
      expect(
        screen.getByText('Coordinated LLM Agents that Automate Enterprise Operations')
      ).toBeInTheDocument();
      expect(screen.getByText('Executive Summary')).toBeInTheDocument();
      expect(screen.getByText(/Fortune 500 organization/i)).toBeInTheDocument();
    });

    it('should render headline metrics and technologies', async () => {
      const component = await CaseStudyPage({ params: Promise.resolve({ slug }) });
      render(component);

      expect(screen.getByText('30%')).toBeInTheDocument();
      expect(screen.getByText('77%')).toBeInTheDocument();
      expect(screen.getByText('72%')).toBeInTheDocument();
      expect(screen.getByText('Databricks')).toBeInTheDocument();
      expect(screen.getByText('Agentic AI')).toBeInTheDocument();
    });

    it('should render all main content sections', async () => {
      const component = await CaseStudyPage({ params: Promise.resolve({ slug }) });
      render(component);

      expect(screen.getByText('The Problem')).toBeInTheDocument();
      expect(screen.getByText('Technical Challenges')).toBeInTheDocument();
      expect(screen.getByText('Solution Architecture')).toBeInTheDocument();
      expect(screen.getByText('Results & Impact')).toBeInTheDocument();
      expect(screen.getByText('Lessons Learned')).toBeInTheDocument();
    });

    it('should link its live demo to the AI agents page', async () => {
      const component = await CaseStudyPage({ params: Promise.resolve({ slug }) });
      render(component);

      const demoLink = screen.getByRole('link', { name: /View Live Demo/i });
      expect(demoLink).toHaveAttribute('href', '/ai-agents');
    });
  });

  describe('Real-Time IoT Platform Case Study', () => {
    const slug = 'realtime-iot-platform';

    it('should render title and key metrics', async () => {
      const component = await CaseStudyPage({ params: Promise.resolve({ slug }) });
      render(component);

      expect(screen.getByText('Real-Time IoT Data Platform')).toBeInTheDocument();
      expect(screen.getByText('99.99%')).toBeInTheDocument();
      expect(screen.getByText('<5s')).toBeInTheDocument();
      expect(screen.getByText('83%')).toBeInTheDocument();
    });

    it('should link its live demo to the streaming page', async () => {
      const component = await CaseStudyPage({ params: Promise.resolve({ slug }) });
      render(component);

      const demoLink = screen.getByRole('link', { name: /View Live Demo/i });
      expect(demoLink).toHaveAttribute('href', '/streaming');
    });
  });

  describe('ML Energy Forecasting Case Study', () => {
    const slug = 'energy-forecasting-ml';

    it('should render title and key metrics', async () => {
      const component = await CaseStudyPage({ params: Promise.resolve({ slug }) });
      render(component);

      expect(screen.getByText('ML Energy Forecasting')).toBeInTheDocument();
      expect(screen.getByText('$2M')).toBeInTheDocument();
      expect(screen.getByText('80%')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should link its live demo to the machine learning page', async () => {
      const component = await CaseStudyPage({ params: Promise.resolve({ slug }) });
      render(component);

      const demoLink = screen.getByRole('link', { name: /View Live Demo/i });
      expect(demoLink).toHaveAttribute('href', '/machine-learning');
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
        { slug: 'agentic-ai-workforce' },
        { slug: 'realtime-iot-platform' },
        { slug: 'energy-forecasting-ml' },
        { slug: 'computer-vision-object-detection' },
        { slug: 'nlp-pipeline-architecture' },
        { slug: 'data-pipeline-orchestration' },
      ]);
    });
  });
});
