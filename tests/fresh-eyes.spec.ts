import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

for (const route of ['', 'portfolio/', 'criacoes/reta-final/', 'privacy/']) {
  for (const width of [320, 390, 768, 1440]) {
    test(`${route || 'home'} contains content at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width >= 768 ? 1000 : 844 });
      await page.goto(route || './');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const geometry = await page.evaluate(() => ({ viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth,
        offenders: Array.from(document.querySelectorAll('main *')).map((el) => ({tag:el.tagName,box:el.getBoundingClientRect()})).filter(({box}) => box.width && (box.right > innerWidth + 1 || box.left < -1)).map(({tag,box}) => ({tag,left:box.left,right:box.right})) }));
      expect(geometry.scrollWidth, JSON.stringify(geometry)).toBeLessThanOrEqual(width);
      expect(geometry.offenders, JSON.stringify(geometry)).toEqual([]);
      const name = `${route.replaceAll('/', '-') || 'home'}-${width}`;
      await mkdir('artifacts/fresh-eyes', { recursive: true });
      await writeFile(`artifacts/fresh-eyes/${name}.json`, JSON.stringify(geometry, null, 2));
      await page.screenshot({path:`artifacts/fresh-eyes/${name}.png`,fullPage:true});
    });
  }
}
