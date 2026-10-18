# Lucas Mateus · Personal home

Personal website and professional portfolio for Lucas Mateus. The public home brings together his background in recruiting, learning and education, selected creations and writing. It is no longer the presentation/dashboard of Capability Lab or Billi Lab.

## Public routes

- [Home](https://lucas-mateus-hq.github.io/lucas-capability-os-pages/): Portuguese personal introduction, work, creations, writing and contact.
- [Professional portfolio](https://lucas-mateus-hq.github.io/lucas-capability-os-pages/portfolio/): existing English experience, evidence and qualifications, preserved at the same URL.
- [Reta Final](https://lucas-mateus-hq.github.io/lucas-capability-os-pages/criacoes/reta-final/): project introduction, explicitly upcoming. No checkout, invented sales URL, waitlist or collection of personal data.
- [Privacy](https://lucas-mateus-hq.github.io/lucas-capability-os-pages/privacy/): existing LinkedIn integration policy, preserved.

The repository name and free Pages address stay unchanged. There is no custom domain, paid service or new hosting dependency. Existing protocol and relay direct URLs remain available for compatibility but are not navigation entries in the personal site. Historical lab components remain in source, unmounted; public telemetry is not loaded by the personal pages.

## Development

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run build
npm run test:static
npm run preview
```

Node >=22 is required. Browser checks run with `npm run test:e2e`, `npm run test:fresh-eyes` and `npm run test:relay` after installing Playwright's Chromium. `.github/workflows/pages.yml` validates public content, real browser behavior and Lighthouse desktop/mobile before deploying main. Pull requests validate without deployment.

For scope, content sources, intentional retirement of lab-specific UI tests and remaining launch requirements, see `docs/PERSONAL_HOME_V1.md`.
