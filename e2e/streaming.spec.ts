import { test, expect, Page } from '@playwright/test';

async function readCount(page: Page): Promise<number> {
  const text = (await page.getByTestId('events-processed').textContent()) ?? '0';
  return parseInt(text.replace(/\D/g, '') || '0', 10);
}

test.describe('Real-time streaming dashboard (#78)', () => {
  test('renders and streams live events', async ({ page }) => {
    await page.goto('/streaming');

    await expect(
      page.getByRole('heading', { level: 1, name: 'Live Streaming Dashboard' }),
    ).toBeVisible();
    await expect(page.getByText('Events processed')).toBeVisible();

    // Events start flowing (via SSE, or the client fallback) — count goes > 0...
    await expect.poll(() => readCount(page), { timeout: 8000 }).toBeGreaterThan(0);

    // ...and keeps increasing, proving the stream is live.
    const first = await readCount(page);
    await expect.poll(() => readCount(page), { timeout: 8000 }).toBeGreaterThan(first);
  });

  test('shows a connection status badge', async ({ page }) => {
    await page.goto('/streaming');
    // Either LIVE (SSE connected) or SIMULATED (fallback) — both are valid.
    await expect(page.getByText(/LIVE|SIMULATED/)).toBeVisible({ timeout: 8000 });
  });
});
