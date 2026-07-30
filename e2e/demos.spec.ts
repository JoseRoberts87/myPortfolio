import { test, expect } from '@playwright/test';

// The interactive ML/CV demos pull large in-browser models (TF.js COCO-SSD,
// MediaPipe, HuggingFace transformers). We block those downloads so the demos
// mount and behave deterministically in CI without fetching ~100MB+, and mock
// the backend YOLO endpoint so the image-upload flow can be driven end-to-end.
const MODEL_CDNS = /storage\.googleapis\.com|tfhub\.dev|huggingface\.co|hf\.co|cdn-lfs|jsdelivr\.net/;

async function blockModelDownloads(page: import('@playwright/test').Page) {
  await page.route(MODEL_CDNS, (route) => route.abort());
}

// A minimal valid 1x1 PNG used as the upload fixture (content is irrelevant —
// the backend inference is mocked).
const PNG_1x1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

test.describe('Computer Vision — image-upload object detection (backend mocked)', () => {
  test('uploads an image and renders the detected objects', async ({ page }) => {
    await blockModelDownloads(page);

    // Mock the backend YOLO detect endpoint with a deterministic response.
    await page.route('**/api/v1/computer-vision/detect/image**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          detections: [
            { class_name: 'person', confidence: 0.95, bbox: [10, 10, 100, 200] },
            { class_name: 'laptop', confidence: 0.88, bbox: [120, 60, 220, 160] },
          ],
          image_width: 640,
          image_height: 480,
        }),
      }),
    );

    await page.goto('/computer-vision');

    // The upload detector section is present.
    await expect(page.getByRole('heading', { name: 'YOLO Object Detection' })).toBeVisible();

    // Select a file, then run detection.
    await page.locator('input[type="file"]').setInputFiles({
      name: 'sample.png',
      mimeType: 'image/png',
      buffer: PNG_1x1,
    });
    await page.getByRole('button', { name: 'Detect Objects' }).click();

    // The mocked detections render in the results list. Scope to the results
    // container (the list right after the heading) — "person" also appears in
    // ModelInfo's COCO class list elsewhere on the page.
    const heading = page.getByRole('heading', { name: 'Detected Objects (2)' });
    await expect(heading).toBeVisible();
    const results = heading.locator('xpath=following-sibling::div');
    await expect(results.getByText('person')).toBeVisible();
    await expect(results.getByText('laptop')).toBeVisible();
    await expect(results.getByText('95%')).toBeVisible();
  });
});

test.describe('Computer Vision — detectors mount', () => {
  test('object, face, and upload detectors all render (models blocked)', async ({ page }) => {
    await blockModelDownloads(page);
    await page.goto('/computer-vision');

    // Every demo section mounts even when its model can't be downloaded.
    await expect(page.getByRole('heading', { name: 'Real-time Object Detection' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Real-time Face Detection' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'YOLO Object Detection' })).toBeVisible();
  });
});

test.describe('Machine Learning — sentiment classifier', () => {
  test('renders the interactive classifier with a load-model control', async ({ page }) => {
    await blockModelDownloads(page);
    await page.goto('/machine-learning');

    await expect(
      page.getByRole('heading', { name: 'Interactive Sentiment Classifier' }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Load Model' })).toBeVisible();
  });

  test('degrades gracefully when the model cannot be loaded', async ({ page, browserName }) => {
    // The transformers.js load-failure timing is only reliably deterministic on
    // Chromium; other engines can hang on the aborted onnxruntime fetch.
    test.skip(browserName !== 'chromium', 'model-load timing is Chromium-stable');

    await blockModelDownloads(page);
    await page.goto('/machine-learning');

    await page.getByRole('button', { name: 'Load Model' }).click();

    // With the model CDN blocked, loading fails into the error state — and the
    // demo must not crash (its heading stays rendered).
    await expect(page.getByText(/^Error:/)).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByRole('heading', { name: 'Interactive Sentiment Classifier' }),
    ).toBeVisible();
  });
});
