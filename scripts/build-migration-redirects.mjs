import { rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
export const routes = ['', 'en/', 'portfolio/', 'portfolio/pt/', 'criacoes/reta-final/', 'en/criacoes/reta-final/', 'privacy/', 'privacidade/'];
rmSync('dist', {recursive:true, force:true});
for (const route of routes) {
  const target='https://lucas-mateus-hq.github.io/'+route;
  const english=['en/','portfolio/','en/criacoes/reta-final/','privacy/'].includes(route);
  const folder=join('dist',route); mkdirSync(folder,{recursive:true});
  writeFileSync(join(folder,'index.html'), `<!doctype html><html lang="${english?'en-US':'pt-BR'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><link rel="canonical" href="${target}"><title>Lucas Mateus</title><noscript><meta http-equiv="refresh" content="0;url=${target}"></noscript><style>body{background:#071b20;color:#f7f3ea;font:1.2rem system-ui;padding:3rem;line-height:1.6}a{color:#73cdba}</style></head><body><h1>Lucas Mateus</h1><p>${english?'The site has moved.':'O site mudou de endereço.'}</p><a href="${target}">${english?'Open the new address':'Abrir o novo endereço'}</a><script>location.replace(${JSON.stringify(target)}+location.search+location.hash);</script></body></html>`);
}
console.log('Built 8 explicit redirects; retired utility paths are not generated.');
