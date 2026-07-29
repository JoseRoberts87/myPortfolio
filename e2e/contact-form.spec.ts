import { test, expect } from '@playwright/test';

test.describe('Contact form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#contact');
    await expect(page.getByRole('heading', { name: 'Get In Touch' })).toBeVisible();
  });

  test('shows validation errors when submitting empty', async ({ page }) => {
    await page.getByRole('button', { name: 'Send Message' }).click();

    await expect(page.getByText('Name is required')).toBeVisible();
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Subject is required')).toBeVisible();
    await expect(page.getByText('Message is required')).toBeVisible();
  });

  test('rejects an invalid email address', async ({ page }) => {
    await page.getByLabel('Name', { exact: false }).fill('Ada Lovelace');
    // Valid per the browser's native type="email" check (no dot required) but
    // rejected by the app's stricter regex, so our custom error is what shows.
    await page.getByLabel('Email', { exact: false }).fill('ada@example');
    await page.getByLabel('Subject', { exact: false }).fill('Hello there');
    await page.getByLabel('Message', { exact: false }).fill('This is a sufficiently long message.');

    await page.getByRole('button', { name: 'Send Message' }).click();

    await expect(page.getByText('Please enter a valid email address')).toBeVisible();
  });

  test('submits successfully and resets the form', async ({ page }) => {
    // Mock the backend so the test does not depend on a running API.
    await page.route('**/api/v1/contact', async (route) => {
      expect(route.request().method()).toBe('POST');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Thanks — I will get back to you soon.' }),
      });
    });

    const nameField = page.getByLabel('Name', { exact: false });
    await nameField.fill('Ada Lovelace');
    await page.getByLabel('Email', { exact: false }).fill('ada@example.com');
    await page.getByLabel('Subject', { exact: false }).fill('Project inquiry');
    await page.getByLabel('Message', { exact: false }).fill('I would love to work with you on a project.');

    await page.getByRole('button', { name: 'Send Message' }).click();

    await expect(page.getByText('Thanks — I will get back to you soon.')).toBeVisible();
    // Form resets on success.
    await expect(nameField).toHaveValue('');
  });
});
