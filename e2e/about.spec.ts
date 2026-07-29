import { test, expect } from '@playwright/test';

test.describe('About / career-story page (#70)', () => {
  test('renders the hero, narrative arc, and career timeline', async ({ page }) => {
    const response = await page.goto('/about');
    expect(response?.status()).toBeLessThan(400);

    await expect(
      page.getByRole('heading', { level: 1, name: 'From bank ledgers to AI agents' }),
    ).toBeVisible();

    // The career timeline is embedded on the page.
    await expect(page.getByRole('heading', { name: 'Professional Experience' })).toBeVisible();

    // Every stop on the 15-year arc is represented (org names come from the timeline).
    for (const org of ['MojoTech', 'Very Technology', 'Evonik', 'Amazon Robotics', 'Bank of America']) {
      await expect(page.getByText(org, { exact: false }).first()).toBeVisible();
    }

    // Leadership is called out explicitly.
    await expect(page.getByRole('heading', { name: 'Leadership & Mentorship' })).toBeVisible();

    // CTA to contact + résumé download.
    await expect(page.getByRole('link', { name: 'Get in touch' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Download r/i })).toHaveAttribute(
      'href',
      '/Jose-Roberts-Resume.pdf',
    );
  });

  test('is reachable from the header "About" link', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation').getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'From bank ledgers to AI agents' }),
    ).toBeVisible();
  });
});
