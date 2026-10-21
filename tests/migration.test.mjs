import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
const routes=['','en/','portfolio/','portfolio/pt/','criacoes/reta-final/','en/criacoes/reta-final/','privacy/','privacidade/'];
for(const route of routes)test(`redirect preserves locale, path, query and fragment: ${route||'home'}`,()=>{
 const html=readFileSync('dist/'+route+'index.html','utf8');
 const target='https://lucas-mateus-hq.github.io/'+route;
 assert.ok(html.includes(`rel="canonical" href="${target}"`));
 assert.ok(html.includes(`href="${target}">`));
 assert.ok(html.includes('name="robots" content="noindex,follow"'));
 assert.ok(html.includes(`<noscript><meta http-equiv="refresh" content="0;url=${target}">`));
 const script=html.match(/<script>(.*?)<\/script>/s)[1];
 let result;vm.runInNewContext(script,{location:{search:'?from=old&x=%22',hash:'#contato',replace:url=>result=url}});
 assert.equal(result,target+'?from=old&x=%22#contato');
});
test('legacy tools and old content assets are not built',()=>{
 for(const path of ['relay','protocol','telemetry.json','images','fonts','lucas-mateus.webp'])assert.equal(existsSync('dist/'+path),false,path);
});
