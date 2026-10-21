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
for route, lang in [('', 'pt-BR'), ('en/', 'en-US'), ('portfolio/pt/', 'pt-BR'),
                    ('portfolio/', 'en-US'), ('criacoes/reta-final/', 'pt-BR'),
                    ('en/criacoes/reta-final/', 'en-US'), ('privacidade/', 'pt-BR'), ('privacy/', 'en-US')]:
    status, body = fetch(route)
    html = body.decode('utf-8')
    assert status == 200 and f'<html lang="{lang}"' in html, route
    assert 'data-capability-registry' not in html and 'live-telemetry.js' not in html, route
    assert 'mailto:' not in html, route
    if route in ('', 'en/'):
        assert 'id="criacoes"' in html and 'id="contato"' in html, route
    if route in ('privacy/', 'privacidade/'):
        assert 'id="hosting"' in html and 'id="relay"' in html and 'id="rights"' in html, route
    checks.append({'path':route, 'status':status, 'language':lang})
for path in ['identity.svg', 'lucas-mateus.webp', 'images/reta-final-tablet.webp',
             'images/social-pt.png', 'images/social-en.png', 'fonts/fonts.css',
             'relay/', 'protocol/CAPABILITY_EVIDENCE_PROTOCOL_v0.1.md']:
    status, body = fetch(path)
    assert status == 200 and body, path
    checks.append({'path':path, 'status':status})
for path in ['telemetry.json', 'live-telemetry.js', 'responsive-guard.css']:
    status, _ = fetch(path)
    assert status == 404, f'Retired asset still public: {path} ({status})'
    checks.append({'path':path, 'status':status, 'expected':'retired'})
Path('artifacts').mkdir(exist_ok=True)
Path('artifacts/publication-receipt.json').write_text(json.dumps({
    'schema_version':1, 'commit_sha':sha, 'url':base,
    'deployment':'VERIFIED', 'checks':checks}, indent=2)+'\n')
print(f'PUBLICATION_VERIFIED: {sha}; {len(checks)} live HTTP checks')
