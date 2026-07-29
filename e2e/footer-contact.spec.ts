import { test, expect } from '@playwright/test';

test.describe('Footer contact details (#77)', () => {
  test('LinkedIn points to the real profile and opens in a new tab', async ({ page }) => {
    await page.goto('/');
    const footer = page.getByRole('contentinfo');

    const linkedin = footer.getByRole('link', { name: 'LinkedIn' }).first();
    await expect(linkedin).toHaveAttribute('href', 'https://www.linkedin.com/in/jose-roberts');
    await expect(linkedin).toHaveAttribute('target', '_blank');
    await expect(linkedin).toHaveAttribute('rel', /noopener/);
  });

  test('shows location and availability', async ({ page }) => {
    await page.goto('/');
    const footer = page.getByRole('contentinfo');
    await expect(footer.getByText('Providence, RI')).toBeVisible();
    await expect(footer.getByText(/Open to Data & AI Architect roles/)).toBeVisible();
  });

  test('has no dead links (removed placeholder Twitter and /docs)', async ({ page }) => {
    await page.goto('/');
    const footer = page.getByRole('contentinfo');

    // The dead "Documentation" -> /docs (404) link is gone.
    await expect(footer.getByRole('link', { name: 'Documentation' })).toHaveCount(0);
    const hrefs = await footer.getByRole('link').evaluateAll((els) =>
      els.map((el) => (el as HTMLAnchorElement).getAttribute('href') || ''),
    );
    expect(hrefs).not.toContain('/docs');
    // The placeholder generic social URLs are gone.
    expect(hrefs).not.toContain('https://linkedin.com');
    expect(hrefs).not.toContain('https://twitter.com');
  });
});

test.describe('Contact section details (#77)', () => {
  test('surfaces availability, location, and LinkedIn near the form', async ({ page }) => {
    await page.goto('/#contact');
    const heading = page.getByRole('heading', { name: 'Get In Touch' });
    await expect(heading).toBeVisible();

    // Scope to the contact card containing the form.
    const card = page.locator('form').locator('xpath=ancestor::*[1]');
    await expect(card.getByText(/Open to Data & AI Architect roles/)).toBeVisible();
    await expect(card.getByText('Providence, RI')).toBeVisible();
    await expect(
      card.getByRole('link', { name: 'LinkedIn' }),
    ).toHaveAttribute('href', 'https://www.linkedin.com/in/jose-roberts');
  });
});
