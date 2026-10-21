"""Verify the deployed release, public routes and retirement of dashboard assets."""
import argparse
import json
import os
from pathlib import Path
import re
import time
from urllib.error import HTTPError
from urllib.request import Request, urlopen

parser = argparse.ArgumentParser()
parser.add_argument('--prepare', action='store_true')
parser.add_argument('--url')
args = parser.parse_args()
sha = os.environ['GITHUB_SHA']
if not re.fullmatch(r'[0-9a-f]{40}', sha):
    raise SystemExit('Invalid release SHA')
if args.prepare:
    Path('dist/deployment.json').write_text(json.dumps({'schema_version': 1, 'commit_sha': sha})+'\n')
    raise SystemExit(0)
base = 'https://lucas-mateus-hq.github.io/lucas-capability-os-pages/'
if not args.url or args.url.rstrip('/')+'/' != base:
    raise SystemExit('Unexpected deployment URL')

def fetch(path, attempt=0):
    req = Request(base+path+f'?release={sha}&attempt={attempt}', headers={'Cache-Control':'no-cache'})
    try:
        with urlopen(req, timeout=30) as response:
            return response.status, response.read()
    except HTTPError as error:
        return error.code, error.read()

for attempt in range(12):
    status, body = fetch('deployment.json', attempt)
    try:
        ready = status == 200 and json.loads(body).get('commit_sha') == sha
    except (ValueError, AttributeError):
        ready = False
    if ready:
        break
    if attempt == 11:
        raise SystemExit('The expected release is not live')
    time.sleep(10)

checks = []
routes = ['', 'en/', 'portfolio/', 'portfolio/pt/', 'criacoes/reta-final/', 'en/criacoes/reta-final/', 'privacy/', 'privacidade/']
for route in routes:
    status, body = fetch(route)
    html = body.decode('utf-8')
    target = 'https://lucas-mateus-hq.github.io/'+route
    assert status == 200 and f'rel="canonical" href="{target}"' in html, route
    assert 'name="robots" content="noindex,follow"' in html, route
    assert f'location.replace({json.dumps(target)}+location.search+location.hash)' in html, route
    with urlopen(Request(target, headers={'Cache-Control':'no-cache'}), timeout=30) as response:
        target_html = response.read().decode('utf-8')
        assert response.status == 200 and f'rel="canonical" href="{target}"' in target_html, target
        assert 'location.replace(' not in target_html, 'Redirect loop'
    checks.append({'path':route, 'status':status, 'target':target, 'target_status':200})
for path in ['relay/', 'relay/app.js', 'protocol/CAPABILITY_EVIDENCE_PROTOCOL_v0.1.md', 'protocol/capability-evidence-receipt.schema.json', 'telemetry.json', 'live-telemetry.js', 'images/reta-final-tablet.webp']:
    status, _ = fetch(path)
    assert status == 404, path
    checks.append({'path':path,'status':status,'expected':'retired'})
Path('artifacts').mkdir(exist_ok=True)
Path('artifacts/publication-receipt.json').write_text(json.dumps({'schema_version':1,'commit_sha':sha,'url':base,'deployment':'VERIFIED','checks':checks},indent=2)+'\n')
print(f'MIGRATION_VERIFIED: {sha}; {len(checks)} old-route/retirement checks plus 8 live destination checks')
