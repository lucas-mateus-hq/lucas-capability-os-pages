# Brazilian Portuguese and American English

The square Brazil/PT and United States/EN links in each page header switch to
the equivalent page. They are native links with full accessible names, active
language indication and touch targets at least 44px high. No JavaScript,
translation service, cookie, browser-language redirect or stored preference is
required. Internal navigation stays in the selected language.

| Brazilian Portuguese | American English |
| --- | --- |
| `/` | `/en/` |
| `/criacoes/reta-final/` | `/en/criacoes/reta-final/` |
| `/portfolio/pt/` | `/portfolio/` |
| `/privacidade/` | `/privacy/` |

Shared page components preserve the same structure, fonts, colors and portrait.
Static editorial dictionaries provide translations; missing keys fail the build
rather than silently mixing languages. Canonical URLs, reciprocal hreflang and
the sitemap describe all eight pages. Existing English direct URLs remain.

The privacy notice now covers the portfolio, GitHub Pages IP/security records,
external contact links, the optional legacy Relay and the private LinkedIn
publishing workflow. It was revised on October 20, 2026. Contact is LinkedIn
only by the Founder's decision; no email or additional data-capture form is added.
This implementation does not claim a formal legal compliance audit.

Reproduce with `npm ci --ignore-scripts`, `npm run build`, `npm run test:static`,
`npx playwright install --with-deps chromium`, `npm run test:e2e` and
`npm run test:fresh-eyes`. Browser suites run in GitHub Actions and include
no-JavaScript language round trips, English navigation, text spacing and eight
routes at 320, 390, 768 and 1440 pixels. The existing relay suite and Lighthouse
gates remain in CI. Publication was authorized by the Founder on October 20, 2026, after visual approval.
