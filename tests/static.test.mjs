import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const prefix = '/lucas-capability-os-pages/';
const origin = 'https://lucas-mateus-hq.github.io';
const routes = ['', 'en/', 'portfolio/', 'portfolio/pt/', 'criacoes/reta-final/', 'en/criacoes/reta-final/', 'privacy/', 'privacidade/'];
const fileFor = (path) => `dist/${path}${path.endsWith('/') || !path ? 'index.html' : ''}`;
const html = (route) => readFileSync(fileFor(route), 'utf8');

test('all canonical public pages build, use the correct base and stay indexable', () => {
  for (const route of routes) {
    const source = html(route);
    assert.match(source, /<h1\b/);
    assert.ok(source.includes(`href="${origin}${prefix}${route}"`), route);
    assert.match(source, /name="robots" content="index,follow/);
    assert.doesNotMatch(source, /live-telemetry\.js|data-capability-registry|data-impact-demo/);
  }
});

test('every internal navigation link, anchor, stylesheet and image resolves in the built artifact', () => {
  for (const route of routes) {
    const source = html(route);
    for (const match of source.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const value = match[1].replaceAll('&amp;', '&');
      const url = new URL(value, origin + prefix + route);
      if (url.origin !== origin) continue;
      assert.ok(url.pathname.startsWith(prefix), `${route}: escaped repository base ${value}`);
      const target = url.pathname.slice(prefix.length);
      const file = fileFor(target);
      assert.ok(existsSync(file), `${route}: missing ${value} => ${file}`);
      if (url.hash) assert.ok(readFileSync(file,'utf8').includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `${route}: missing anchor ${value}`);
    }
  }
});

test('home is personal, upcoming product is honest, and no data capture or purchase URL was invented', () => {
  const home = html('');
  assert.match(home, /lang="pt-BR"/);
  for (const content of ['Lucas Mateus','Wellhub','Reckitt','TikTok','id="criacoes"','id="trabalho"','id="escritos"','id="sobre"']) assert.ok(home.includes(content),content);
  assert.doesNotMatch(home, /Capability Lab|Billi Lab|C Lab|Telemetry Mode|Scaffold/);
  const product = html('criacoes/reta-final/');
  assert.match(product, /Lançamento em breve/);
  assert.match(product, /Hotmart/);
  assert.doesNotMatch(product, /href="[^"]*hotmart|<form\b|<input\b|<button\b/);
  assert.ok(home.includes(`src="${prefix}lucas-mateus.webp"`), 'serve an optimized copy of the existing public profile portrait');
  assert.ok(existsSync('dist/lucas-mateus.webp'));
});

test('professional evidence and legacy public utility files remain present', () => {
  const portfolio = html('portfolio/');
  for (const value of ['Talent Acquisition','Recruiting Operations','14 of 15 (93%)','Wellhub','Reckitt','TikTok','RealLife English','degree not completed','id="rnd"']) assert.ok(portfolio.includes(value),value);
  assert.doesNotMatch(portfolio,/Capability Lab/);
  for (const path of ['protocol/CAPABILITY_EVIDENCE_PROTOCOL_v0.1.md','protocol/capability-evidence-receipt.schema.json','relay/index.html','relay/app.js']) assert.ok(existsSync(`dist/${path}`),path);
});

test('actual dark, paper, sage and product text pairs meet WCAG AA contrast', () => {
  const luminance = (hex) => {
    const rgb = hex.match(/[0-9a-f]{2}/gi).map((x) => parseInt(x,16)/255).map((x) => x<=.04045 ? x/12.92 : ((x+.055)/1.055)**2.4);
    return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
  };
  const pairs=[
    ['263641','f3efe6'],['263641','c3cecf'],['263641','f1b895'],
    ['eee9df','25343b'],['eee9df','5b4540'],['faf7f0','4b5c61'],
    ['183d3b','f3efe6'],['183d3b','d9c99e'],['183d3b','c3d7d1'],
    ['102f2f','ccdbd4'],['102f2f','bfd5cd'],['d3e5d2','203d35'],
    ['e9a77f','25343b'],['f9efe0','25343b'],['f9efe0','9c4a2f'],
    ['d9e2df','25343b'],['d9e2df','3b5553'],['d9e2df','385953'],
    ['f1b895','25343b'],['f1b895','5b3c2e'],['25343b','fff6e9']
  ];
  for (const [bg,fg] of pairs) {
    const values=[luminance(bg),luminance(fg)].sort((a,b)=>a-b);
    assert.ok((values[1]+.05)/(values[0]+.05)>=4.5,`${fg} on ${bg}`);
  }
});


test('locale pairs have reciprocal language links and preserve assets and evidence', () => {
  for (const [pt,en] of [['','en/'],['criacoes/reta-final/','en/criacoes/reta-final/'],['portfolio/pt/','portfolio/'],['privacidade/','privacy/']]) {
    const a=html(pt),b=html(en);
    assert.match(a, /<html lang="pt-BR"/); assert.match(b, /<html lang="en-US"/);
    for(const page of [a,b]) for(const [lang,route] of [['pt-BR',pt],['en-US',en]]) assert.ok(page.includes(`hreflang="${lang}" href="${origin}${prefix}${route}"`),`${pt} / ${en}: alternate ${lang}`);
    const images = x=>[...x.matchAll(/<img[^>]*src="([^"]+)"/g)].map(m=>m[1]);
    assert.deepEqual(images(a),images(b));
    const sections=x=>[...x.matchAll(/<section[^>]*id="([^"]+)"/g)].map(m=>m[1]);
    assert.deepEqual(sections(a),sections(b));
    assert.doesNotMatch(a+b,/translate\.google|localStorage|document\.cookie/);
  }
  assert.match(html('en/'), /Coming soon/);
  assert.match(html('portfolio/pt/'), /14 de 15 \(93%\)/);
  assert.match(html('portfolio/pt/'), /graduação não concluída/);
});
