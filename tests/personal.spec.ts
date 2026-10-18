import { expect, test } from '@playwright/test';

test('home presents Lucas and real public destinations without the lab dashboard', async ({ page }) => {
  await page.goto('./');
  await expect(page).toHaveTitle('Lucas Mateus · Pessoas, aprendizagem e criações');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('ideias em prática');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(38, 54, 65)');
  await expect(page.locator('[data-capability-registry], [data-impact-demo], [data-telemetry-mode]')).toHaveCount(0);
  await expect(page.locator('script[src*="live-telemetry"]')).toHaveCount(0);
  await expect(page.getByRole('img', { name: 'Lucas Mateus', exact: true })).toBeVisible();
  await expect.poll(() => page.getByRole('img', { name: 'Lucas Mateus', exact: true }).evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0), {timeout:15000}).toBe(true);
  await page.getByRole('link', { name: 'Conheça meu trabalho' }).click();
  await expect(page).toHaveURL(/\/portfolio\/$/);
  await expect(page.locator('#page-title')).toContainText('Talent Acquisition');
});

test('upcoming product has a working detail route and no fabricated checkout', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('link', { name: 'Explore minhas criações' }).click();
  await expect(page).toHaveURL(/#criacoes$/);
  await expect(page.locator('#reta-final')).toContainText('Lançamento em breve');
  await page.getByRole('link', { name: 'Conheça a proposta' }).click();
  await expect(page).toHaveURL(/\/criacoes\/reta-final\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Reta Final.');
  await expect(page.locator('.notice')).toContainText('Hotmart');
  await expect(page.locator('a[href*="hotmart"], form, input, button')).toHaveCount(0);
  await page.getByRole('link', { name: 'Voltar ao início', exact: true }).click();
  await expect(page).toHaveURL(/\/lucas-capability-os-pages\/$/);
});

test('portfolio retains evidence, career history, direct anchors and personal return link', async ({ page }) => {
  await page.goto('portfolio/#evidence');
  await expect(page.locator('#evidence')).toContainText('14 of 15 (93%)');
  for (const name of ['Wellhub', 'Reckitt', 'TikTok', 'RealLife English']) await expect(page.locator('.experience-list')).toContainText(name);
  await expect(page.locator('#background')).toContainText('degree not completed');
  await expect(page.locator('#rnd')).toContainText('Human–AI collaboration');
  await expect(page.locator('body')).not.toContainText('Capability Lab');
  await page.getByRole('link', { name: 'Lucas Mateus · Home' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Pessoas');
});

test('keyboard access starts with skip link and works without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/lucas-capability-os-pages/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#conteudo$/);
  await page.getByRole('link', { name: 'Conheça a proposta' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Reta Final.');
  await context.close();
});

test('existing public document and privacy links remain available', async ({ page, request }) => {
  for (const path of ['privacy/', 'protocol/CAPABILITY_EVIDENCE_PROTOCOL_v0.1.md', 'relay/', 'relay/app.js']) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
  }
  await page.goto('./');
  await page.getByRole('link', { name: 'Privacidade', exact: true }).click();
  await expect(page).toHaveURL(/\/privacy\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacy Policy');
});
