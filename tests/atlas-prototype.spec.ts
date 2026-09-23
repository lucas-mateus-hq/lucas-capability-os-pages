import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const overflow = async (page: import('@playwright/test').Page) =>
  page.evaluate(() => ({
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    overflow: document.documentElement.scrollWidth - window.innerWidth,
  }));

const maxNodeOverlapArea = async (page: import('@playwright/test').Page) =>
  page.locator('[data-node]').evaluateAll((elements) => {
    const boxes = elements.map((element) => element.getBoundingClientRect());
    let max = 0;
    for (let i = 0; i < boxes.length; i += 1) {
      for (let j = i + 1; j < boxes.length; j += 1) {
        const width = Math.max(0, Math.min(boxes[i].right, boxes[j].right) - Math.max(boxes[i].left, boxes[j].left));
        const height = Math.max(0, Math.min(boxes[i].bottom, boxes[j].bottom) - Math.max(boxes[i].top, boxes[j].top));
        max = Math.max(max, width * height);
      }
    }
    return max;
  });

test('atlas prototype exposes a typed interactive constellation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('./atlas-prototype/');

  const canvas = page.locator('[data-atlas-canvas]');
  await expect(page.locator('#atlas-title')).toHaveText('How experience becomes capability.');
  await expect(canvas).toHaveAttribute('data-atlas-ready', 'true');
  await expect(page.locator('[data-node]')).toHaveCount(5);
  await expect(page.locator('[data-edge]')).toHaveCount(4);

  const candidate = page.locator('[data-node="candidate-experience"]');
  const before = await candidate.boundingBox();
  expect(before).not.toBeNull();

  await page.locator('[data-node="reckitt"]').click();
  await expect(canvas).toHaveAttribute('data-selected', 'reckitt');
  await expect(page.locator('[data-node="reckitt"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-drawer-title]')).toHaveText('Reckitt');
  await expect(page.locator('[data-drawer-body]')).toContainText('Full-cycle recruiting');
  await expect(page.locator('[data-relations]')).toContainText('Candidate Experience');

  await page.waitForTimeout(700);
  const after = await candidate.boundingBox();
  expect(after).not.toBeNull();
  expect(Math.abs((after?.x ?? 0) - (before?.x ?? 0))).toBeGreaterThan(8);

  await expect(page.locator('[data-edge].is-active')).toHaveCount(2);
  await expect(page.locator('[data-node="q1-survey"]')).toHaveClass(/is-muted/);

  await page.locator('[data-reset]').click();
  await expect(canvas).toHaveAttribute('data-selected', '');
  await expect(page.locator('[data-drawer-title]')).toHaveText('Select a territory.');

  const geometry = await overflow(page);
  expect(geometry.overflow, JSON.stringify(geometry)).toBe(0);

  await mkdir('artifacts/atlas-prototype', { recursive: true });
  await page.screenshot({ path: 'artifacts/atlas-prototype/desktop.png', fullPage: true });
});

test('atlas prototype remains readable and contained on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./atlas-prototype/');

  const canvas = page.locator('[data-atlas-canvas]');
  await expect(canvas).toHaveAttribute('data-atlas-ready', 'true');
  await page.waitForTimeout(400);
  expect(await maxNodeOverlapArea(page)).toBeLessThan(4);

  await page.locator('[data-node="candidate-experience"]').click();
  await expect(canvas).toHaveAttribute('data-selected', 'candidate-experience');
  await expect(page.locator('[data-drawer-title]')).toHaveText('Candidate Experience');
  await expect(page.locator('[data-relations]')).toContainText('Q1 2023 Survey');
  await page.waitForTimeout(700);
  expect(await maxNodeOverlapArea(page)).toBeLessThan(4);

  const geometry = await overflow(page);
  expect(geometry.overflow, JSON.stringify(geometry)).toBe(0);

  await mkdir('artifacts/atlas-prototype', { recursive: true });
  await page.screenshot({ path: 'artifacts/atlas-prototype/mobile.png', fullPage: true });
});
