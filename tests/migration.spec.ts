import {test,expect} from '@playwright/test';
for(const route of ['', 'en/', 'portfolio/', 'portfolio/pt/', 'criacoes/reta-final/', 'en/criacoes/reta-final/', 'privacy/', 'privacidade/']) {
 test(`browser forwards old route ${route||'home'}`,async({page})=>{
  const target='https://lucas-mateus-hq.github.io/'+route+'?from=old#contato';
  await page.route('https://lucas-mateus-hq.github.io/**',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><h1>Destination probe</h1>'}));
  // Route interception verifies browser redirect behavior; destination content is separately verified live after deployment.
  await page.goto('./'+route+'?from=old#contato').catch(error=>{if(!String(error).includes('ERR_ABORTED'))throw error;});
  await expect(page).toHaveURL(target);
 });
}
