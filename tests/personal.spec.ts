import { expect, test } from '@playwright/test';

test('home presents Lucas and real public destinations without the lab dashboard', async ({ page }) => {
  await page.goto('./');
  await expect(page).toHaveTitle('Lucas Mateus · Pessoas, aprendizagem e criações');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('ideias em prática');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('body')).toHaveCSS('font-family', /Source Sans 3/);
  expect(await page.evaluate(() => document.fonts.check('18px "Source Sans 3"') && document.fonts.check('40px "Source Serif 4"'))).toBe(true);
  await expect(page.locator('.hero-intro')).toHaveCSS('font-size', '18px');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(38, 54, 65)');
  await expect(page.locator('#trabalho')).toHaveCSS('background-color', 'rgb(238, 233, 223)');
  await expect(page.locator('#criacoes')).toHaveCSS('background-color', 'rgb(24, 61, 59)');
  await expect(page.locator('#escritos')).toHaveCSS('background-color', 'rgb(217, 226, 223)');
  await expect(page.locator('#contato')).toHaveCSS('background-color', 'rgb(241, 184, 149)');
  await expect(page.locator('[data-capability-registry], [data-impact-demo], [data-telemetry-mode]')).toHaveCount(0);
  await expect(page.locator('script[src*="live-telemetry"]')).toHaveCount(0);
  await expect(page.getByRole('img', { name: 'Lucas Mateus', exact: true })).toBeVisible();
  await expect.poll(() => page.getByRole('img', { name: 'Lucas Mateus', exact: true }).evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0), {timeout:15000}).toBe(true);
  await page.getByRole('link', { name: 'Conheça meu trabalho' }).click();
  await expect(page).toHaveURL(/\/portfolio\/pt\/$/);
  await expect(page.locator('#page-title')).toContainText('Recrutamento');
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
  await expect(page.getByRole('heading', { level: 1 })).toContainText('People');
});

test('keyboard access starts with skip link and works without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/lucas-capability-os-pages/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#conteudo$/);
  await expect(page.locator('main')).toBeFocused();
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
  await expect(page).toHaveURL(/\/privacidade\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Política de Privacidade');
});

test('navigation order, destination cues and touch targets match the visitor journey', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  const nav = page.getByRole('navigation', { name: 'Navegação principal' });
  await expect(nav.getByRole('link')).toHaveText(['Trabalho', 'Criações', 'Sobre', 'Contato']);
  await expect(page.locator('.destination-note')).toContainText('inglês americano');
  expect(await page.locator('#trabalho').evaluate(el => Boolean(el.compareDocumentPosition(document.querySelector('#criacoes')!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  for (const link of await page.locator('.site-header nav a, .actions a, .text-link, .footer-links a').all()) {
    const box = await link.boundingBox();
    expect(box?.height, await link.innerText()).toBeGreaterThanOrEqual(44);
  }
  await nav.getByRole('link', { name: 'Contato', exact: true }).click();
  await expect(page).toHaveURL(/#contato$/);
  await expect(page.locator('#contato').getByRole('link')).toHaveAttribute('href', 'https://www.linkedin.com/in/lucasmateus/');
});

test('text spacing customization preserves content and controls', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  for (const route of ['./', 'en/', 'criacoes/reta-final/', 'en/criacoes/reta-final/']) {
    await page.goto(route);
    await page.addStyleTag({content:'* { line-height:1.5 !important; letter-spacing:.12em !important; word-spacing:.16em !important; } p { margin-bottom:2em !important; }'});
    const overflow = await page.evaluate(() => Array.from(document.querySelectorAll('main a, main p, main h1, main h2, main h3, .site-header nav a')).filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.textContent));
    expect(overflow).toEqual([]);
    const geometry = await page.evaluate(() => ({width:document.documentElement.scrollWidth, offenders:Array.from(document.querySelectorAll('body *')).map(el=>({tag:el.tagName,cls:el.getAttribute('class'),right:el.getBoundingClientRect().right})).filter(el=>el.right>321)}));
    expect(geometry.width, JSON.stringify({route,...geometry})).toBeLessThanOrEqual(320);
    await expect(page.getByRole('heading', {level:1})).toBeVisible();
  }
});


for (const [pt,en,title] of [['./','en/','People.'],['criacoes/reta-final/','en/criacoes/reta-final/','Reta Final.'],['portfolio/pt/','portfolio/','Talent Acquisition'],['privacidade/','privacy/','Privacy Policy']] as const) {
  test(`language switch keeps the equivalent page: ${pt}`, async ({browser}) => {
    const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
    const page=await context.newPage();
    await page.goto('http://127.0.0.1:4321/lucas-capability-os-pages/'+(pt==='./'?'':pt));
    const english=page.getByRole('link',{name:'English (United States)',exact:true});
    await expect(english).toBeVisible();
    expect((await english.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    await english.click();
    await expect(page).toHaveURL('http://127.0.0.1:4321/lucas-capability-os-pages/'+en);
    await expect(page.locator('html')).toHaveAttribute('lang','en-US');
    await expect(page.getByRole('heading',{level:1})).toContainText(title);
    await expect(page.getByRole('link',{name:'English (United States)',exact:true})).toHaveAttribute('aria-current','page');
    await page.getByRole('link',{name:'Português (Brasil)',exact:true}).click();
    await expect(page.locator('html')).toHaveAttribute('lang','pt-BR');
    await expect(page).toHaveURL('http://127.0.0.1:4321/lucas-capability-os-pages/'+(pt==='./'?'':pt));
    await context.close();
  });
}

test('English navigation stays English and exposes honest product status',async({page})=>{
  await page.goto('en/');
  await page.getByRole('link',{name:'Explore my creations'}).click();
  await page.getByRole('link',{name:'Explore Reta Final',exact:false}).click();
  await expect(page).toHaveURL(/\/en\/criacoes\/reta-final\/$/);
  await expect(page.locator('.notice')).toContainText('Coming soon');
  await expect(page.locator('a[href*="hotmart"],form,input,button')).toHaveCount(0);
  await page.getByRole('link',{name:'Back to home',exact:true}).click();
  await expect(page).toHaveURL(/\/en\/$/);
  await page.getByRole('link',{name:'Explore my work'}).click();
  await expect(page).toHaveURL(/\/portfolio\/$/);
  await expect(page.locator('#evidence')).toContainText('14 of 15 (93%)');
});
