# Lucas Mateus · Personal home

Personal website and professional portfolio for Lucas Mateus. The public home brings together his background in recruiting, learning and education, selected creations and writing. It is no longer the presentation/dashboard of Capability Lab or Billi Lab.

## Public routes

- [Home](https://lucas-mateus-hq.github.io/lucas-capability-os-pages/): Portuguese personal introduction, work, creations, writing and contact.
- [Professional portfolio](https://lucas-mateus-hq.github.io/lucas-capability-os-pages/portfolio/): existing English experience, evidence and qualifications, preserved at the same URL.
- [Reta Final](https://lucas-mateus-hq.github.io/lucas-capability-os-pages/criacoes/reta-final/): project introduction, explicitly upcoming. No checkout, invented sales URL, waitlist or collection of personal data.
- [Privacy](https://lucas-mateus-hq.github.io/lucas-capability-os-pages/privacy/): existing LinkedIn integration policy, preserved.

The repository name and free Pages address stay unchanged. There is no custom domain, paid service or new hosting dependency. Legacy protocol and Relay URLs have been retired from the site and now return 404; their implementation remains recoverable in Git history. Historical lab components remain in source, unmounted; the old public telemetry assets have been retired. The Founder approved publication and LinkedIn-only contact; see docs/PUBLICATION.md.

## Development

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run build
npm run test:static
npm run preview
```

Node >=22 is required. Browser checks run with `npm run test:e2e`, `npm run test:fresh-eyes` and `npm run test:relay` (retired-route HTTP regression) after installing Playwright's Chromium. `.github/workflows/pages.yml` validates public content, real browser behavior and Lighthouse desktop/mobile before deploying main. Pull requests validate without deployment.

For scope, content sources, intentional retirement of lab-specific UI tests and remaining launch requirements, see `docs/PERSONAL_HOME_V1.md`.

The home portrait is an optimized WebP copy of Lucas's existing public GitHub avatar (user 322756565), capped at 480px without upscaling with Sharp at quality 85. Its composition is unchanged. The original PNG was approximately 913KB; the optimized asset is served with the site to avoid the third-party image request. No private voice-profile source or samples are published in this repository.
