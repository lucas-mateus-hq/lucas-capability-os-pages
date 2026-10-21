import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

for (const route of ['', 'en/', 'portfolio/', 'portfolio/pt/', 'criacoes/reta-final/', 'en/criacoes/reta-final/', 'privacy/', 'privacidade/']) {
  for (const width of [320, 390, 768, 1440]) {
    test(`${route || 'home'} contains content at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width >= 768 ? 1000 : 844 });
      await page.goto(route || './');
      await page.evaluate(() => document.fonts.ready);
      const artwork = page.locator('.product-art img');
      if (await artwork.count()) {
        await artwork.scrollIntoViewIfNeeded();
        await expect.poll(() => artwork.evaluate((img:HTMLImageElement)=>img.complete && img.naturalWidth===1200)).toBe(true);
        await page.evaluate(()=>window.scrollTo(0,0));
      }
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const geometry = await page.evaluate(() => ({ viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth,
        offenders: Array.from(document.querySelectorAll('main *')).map((el) => ({tag:el.tagName,className:el.getAttribute('class'),box:el.getBoundingClientRect()})).filter(({box}) => box.width && (box.right > innerWidth + 1 || box.left < -1)).map(({tag,className,box}) => ({tag,className,left:box.left,right:box.right})) }));
      expect(geometry.scrollWidth, JSON.stringify(geometry)).toBeLessThanOrEqual(width);
      expect(geometry.offenders, JSON.stringify(geometry)).toEqual([]);
      const header = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('header.site-header a, .topbar a, .privacy-languages a')).map(el => ({name:el.getAttribute('aria-label') || el.textContent,box:el.getBoundingClientRect()})).filter(({box})=>box.width && box.height);
        return links.flatMap((a,i)=>links.slice(i+1).filter(b=>Math.min(a.box.right,b.box.right)-Math.max(a.box.left,b.box.left)>1 && Math.min(a.box.bottom,b.box.bottom)-Math.max(a.box.top,b.box.top)>1).map(b=>[a.name,b.name]));
      });
      expect(header, 'Header controls must not overlap').toEqual([]);
      const name = `${route.replaceAll('/', '-') || 'home'}-${width}`;
      await mkdir('artifacts/fresh-eyes', { recursive: true });
      await writeFile(`artifacts/fresh-eyes/${name}.json`, JSON.stringify(geometry, null, 2));
      await page.screenshot({path:`artifacts/fresh-eyes/${name}.png`,fullPage:true});
    });
  }
}
