import { test, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Always-on accessibility scan (issue #138).
 *
 * Runs axe-core against every primary route on a real browser, catching
 * contrast / ARIA / label / landmark regressions on every PR — complementing
 * the component-level jest-axe suite (which can't measure real color contrast
 * under jsdom) and the one-time manual audit in #87.
 */

// Primary, mostly-static routes. Demo pages that mount heavy client models
// (computer-vision, machine-learning) are covered by the shared Header/Footer
// they render; their canvases pull in third-party markup that isn't ours to
// fix, so they're intentionally out of this scan.
const ROUTES = [
  { path: '/', name: 'home' },
  { path: '/about', name: 'about' },
  { path: '/web-dev', name: 'web development' },
  { path: '/data-pipelines', name: 'data pipelines' },
  { path: '/analytics', name: 'analytics' },
  { path: '/streaming', name: 'streaming' },
  { path: '/signal-processing', name: 'signal processing' },
  { path: '/cloud-devops', name: 'cloud & devops' },
  { path: '/case-studies', name: 'case studies' },
  { path: '/github', name: 'github' },
];

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

async function scan(page: Page) {
  return new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
}

/** Compact, readable summary of any violations for the failure message. */
function summarize(violations: Awaited<ReturnType<typeof scan>>['violations']) {
  return violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    nodes: v.nodes.map((n) => n.target.join(' ')),
  }));
}

test.describe('accessibility (axe-core)', () => {
  for (const route of ROUTES) {
    test(`${route.name} page has no WCAG A/AA violations`, async ({ page }) => {
      await page.goto(route.path);
      // Wait for the primary heading so we scan settled content, not a skeleton.
      await page.locator('h1').first().waitFor({ state: 'visible' });

      const results = await scan(page);
      expect(summarize(results.violations)).toEqual([]);
    });
  }

  test('skip link is present and focusable on the home page', async ({ page }) => {
    await page.goto('/');
    // Tab from the top of the document should land on the skip link first.
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: /skip to main content/i });
    await expect(skip).toBeFocused();
    await expect(skip).toHaveAttribute('href', '#main-content');
  });
});
