import { test, expect } from '@playwright/test';

/**
 * Every route reachable from the header "Work" menu should render its hero
 * heading and return a successful response (no 404 / 500).
 *
 * Note: `/ai-agents` (the "AI Chat" primary link) is intentionally omitted —
 * that page is tracked separately in issue #69 and does not exist yet.
 */
const FEATURE_PAGES = [
  { path: '/web-dev', heading: 'Web Development' },
  { path: '/data-pipelines', heading: 'Data Pipelines' },
  { path: '/analytics', heading: 'Analytics Dashboard' },
  { path: '/machine-learning', heading: 'Machine Learning & NLP' },
  { path: '/computer-vision', heading: 'Computer Vision' },
  { path: '/signal-processing', heading: 'Signal Processing' },
  { path: '/cloud-devops', heading: 'Cloud & DevOps' },
  { path: '/case-studies', heading: 'Deep-Dive Technical Case Studies' },
  { path: '/github', heading: 'GitHub Activity' },
] as const;

test.describe('Feature pages', () => {
  for (const { path, heading } of FEATURE_PAGES) {
    test(`${path} renders its hero heading`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status(), `${path} should respond OK`).toBeLessThan(400);

      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();

      // The shared header should be present on every feature page.
      await expect(page.getByRole('link', { name: 'Jose Roberts' })).toBeVisible();
    });
  }
});
