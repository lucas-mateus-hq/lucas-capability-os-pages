# Personal home v1

## Approved direction

2026-10-18: Lucas approved adapting the existing free Pages site to a personal home, retaining the professional portfolio, with a medium-dark background. No custom domain purchase, paid hosting or business storefront is needed. Reta Final will have its own sales page on Hotmart. Its exact sales URL has not been provided, so the personal site has no purchase link or fake CTA. It remains explicitly upcoming.

The public identity is Lucas Mateus. Primary navigation: work, creations, writing, about. Home is Portuguese; the existing English recruiter portfolio remains at `/portfolio/` and retains its evidence and direct anchors. No invented articles, book releases, case studies, testimonials, role titles, conversion figures or social accounts were added. Education is explicitly incomplete; Psychology is on hold. Existing published role scopes and figures are retained, without implying company endorsement.

## Design and implementation

Astro static output and existing GitHub Pages base URL remain. The home and creation page share a small layout and CSS, with slate background `#263641`, lighter surfaces `#2e414c`, ivory text, mint accents and muted gold. There are no new runtime libraries, remote fonts, trackers, forms, personal-memory features, checkout, consent banners or paid services. The already-public GitHub profile portrait is reused from its existing avatar service; viewing it sends an ordinary image request to GitHub. The product title treatment is typographic site artwork, not an asserted final product cover.

Existing privacy and professional routes remain; public protocol and relay direct URLs are retained for compatibility. The legacy lab components remain in repository history/source but are not mounted as a public page. The Astro postbuild hook that injected telemetry into home was removed. Historical telemetry files remain direct static assets for compatibility, with no active personal-page consumer; this is not a deletion of past public material or a change to the private Lab. Telemetry-only commits do not trigger site publication anymore. No other repository, private runtime, canonical priority or profile repository was changed.

## Verification transition

The old `tests/registry.spec.ts` and lab-specific fresh-eyes assertions described a retired homepage experience (sorting capabilities, simulated impact steps, telemetry transition). They were replaced with tests of the new visitor contract, not skipped to make the old assertions green. Legacy relay E2E is unchanged. Initial real browser execution exposed a transparent body canvas (root color alone) and unstable native navigation with global smooth scrolling when JavaScript is disabled. The body now explicitly paints the dark background and default anchor scrolling is instant, preserving the existing browser assertions. Public credential-pattern checks, Astro checking/build and Lighthouse performance/accessibility thresholds remain. New static checks validate every internal built link/anchor/asset, canonical routes, indexing, preserved evidence and text contrast on both surfaces. Browser checks cover real navigation, no-JavaScript operation, direct URLs, image load, and 320/390/768/1440px containment on all four pages.

The current managed Work environment has no `control-browser` skill, so its local preview/browser QA is NOT_EXECUTED per the Sites managed-preview guidance. It does not install or improvise a local browser path. GitHub Actions runs the configured browser checks in its own runner; only completed results may be reported as PASS. Browser test definitions are not execution evidence by themselves. The static compiled preview can be inspected separately; it is not a claim of live deployment.

## Publication and remaining launch work

The existing repository and URL are kept. Changes are made on an isolated branch for review. Do not treat a branch/PR as a live Pages deployment. A main merge triggers existing free Pages publication only after its gates pass. A correct Hotmart sales URL can replace the upcoming notice when Lucas confirms the product is launched. A future custom domain is optional and does not block this site.
