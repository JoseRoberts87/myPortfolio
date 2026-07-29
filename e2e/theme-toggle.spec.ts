import { test, expect } from '@playwright/test';

/**
 * The theme toggle lives in the header. It flips the `dark` class on
 * <html>, persists the choice to localStorage, and that choice survives a
 * reload. We assert on relative behavior (the theme flips and persists) rather
 * than an absolute starting theme, since the initial value depends on the
 * system color-scheme preference.
 */
test.describe('Theme toggle', () => {
  const isDark = (page: import('@playwright/test').Page) =>
    page.evaluate(() => document.documentElement.classList.contains('dark'));

  test('toggles the theme and persists it across reloads', async ({ page }) => {
    await page.goto('/');

    // The visible toggle is the desktop one at the default (desktop) viewport.
    const toggle = page.getByRole('button', { name: /switch to (dark|light) mode/i }).first();
    await expect(toggle).toBeVisible();

    const before = await isDark(page);

    await toggle.click();
    await expect.poll(() => isDark(page)).toBe(!before);

    // The choice is written to localStorage.
    const stored = await page.evaluate(() => localStorage.getItem('theme'));
    expect(stored).toBe(before ? 'light' : 'dark');

    // And it survives a reload.
    await page.reload();
    await expect.poll(() => isDark(page)).toBe(!before);
  });
});
