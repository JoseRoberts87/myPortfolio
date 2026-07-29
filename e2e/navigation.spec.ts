import { test, expect } from '@playwright/test';

test.describe('Header navigation', () => {
  test('home page loads with the hero and brand', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: 'Jose Roberts' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Jose Roberts' })).toBeVisible();
  });

  test('Work dropdown opens and navigates to a feature page', async ({ page }) => {
    await page.goto('/');

    const workButton = page.getByRole('button', { name: 'Work' });
    await expect(workButton).toHaveAttribute('aria-expanded', 'false');

    await workButton.click();
    await expect(workButton).toHaveAttribute('aria-expanded', 'true');

    // Dropdown links become visible; navigate to Data Pipelines. Scope to the
    // header nav so we don't match the homepage card or the footer link.
    await page.getByRole('navigation').getByRole('link', { name: 'Data Pipelines' }).click();
    await expect(page).toHaveURL(/\/data-pipelines$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Data Pipelines' })).toBeVisible();
  });

  test('clicking the brand returns to the home page', async ({ page }) => {
    await page.goto('/web-dev');
    await expect(page).toHaveURL(/\/web-dev$/);

    await page.getByRole('link', { name: 'Jose Roberts' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Jose Roberts' })).toBeVisible();
  });

  test('the "Let\'s talk" CTA links to the contact section', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: "Let's talk" }).click();
    await expect(page).toHaveURL(/#contact$/);
    await expect(page.getByRole('heading', { name: 'Get In Touch' })).toBeVisible();
  });
});
