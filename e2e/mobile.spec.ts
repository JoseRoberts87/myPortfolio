import { test, expect } from '@playwright/test';

// Run this whole suite emulating a small phone viewport (iPhone SE class).
// We set the mobile properties explicitly rather than spreading a Playwright
// device descriptor, since those flip `defaultBrowserType` to webkit — this
// project runs on chromium, which is also the only engine that supports the
// `isMobile` emulation flag.
test.use({
  viewport: { width: 375, height: 667 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});

const PAGES = [
  '/',
  '/web-dev',
  '/data-pipelines',
  '/analytics',
  '/machine-learning',
  '/computer-vision',
  '/signal-processing',
  '/cloud-devops',
  '/case-studies',
  '/github',
] as const;

test.describe('Mobile layout', () => {
  for (const path of PAGES) {
    test(`${path} has no horizontal overflow`, async ({ page }) => {
      await page.goto(path);
      // Let charts / late layout settle.
      await page.waitForTimeout(300);

      const { scrollWidth, innerWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));

      // Allow 1px for sub-pixel rounding.
      expect(
        scrollWidth,
        `${path} overflows horizontally by ${scrollWidth - innerWidth}px`,
      ).toBeLessThanOrEqual(innerWidth + 1);
    });
  }
});

test.describe('Mobile navigation drawer', () => {
  test('the hamburger menu opens, navigates, and closes', async ({ page }) => {
    await page.goto('/');

    // Desktop nav is hidden on mobile; the hamburger toggle is shown instead.
    const menuButton = page.getByRole('button', { name: 'Toggle navigation menu' });
    await expect(menuButton).toBeVisible();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    await menuButton.click();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');

    // The drawer lists the Work routes; tapping one navigates and closes the
    // drawer. Scope to the header so we don't match the footer's link.
    const link = page.getByRole('banner').getByRole('link', { name: 'Computer Vision' });
    await expect(link).toBeVisible();
    await link.click();

    await expect(page).toHaveURL(/\/computer-vision$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Computer Vision' })).toBeVisible();
    // Route change closes the drawer.
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('the theme toggle is reachable on mobile', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: /switch to (dark|light) mode/i }).first();
    await expect(toggle).toBeVisible();

    const isDark = () => page.evaluate(() => document.documentElement.classList.contains('dark'));
    const before = await isDark();
    await toggle.click();
    await expect.poll(isDark).toBe(!before);
  });
});
