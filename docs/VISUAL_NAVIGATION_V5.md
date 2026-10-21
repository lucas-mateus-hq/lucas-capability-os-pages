# Editorial navigation and sharing refinement

Candidate for PR #28, October 21, 2026. Supersedes the typography, portrait
frame and background details of VISUAL_POLISH_V4.md. No deployment is included.

- The native language links still open the equivalent page without JavaScript.
  A small local enhancement preserves the current section when JavaScript is
  available, including scrolling without a URL fragment. Both locales retain
  identical section IDs. It does not translate content at runtime, track users,
  store preferences or redirect them automatically.
- Headers stay sticky on desktop and mobile. A ResizeObserver measures header
  height for fragment offsets, including wrapping and custom text spacing.
  CSS has a no-script offset fallback. Reduced transparency disables header blur.
- Buttons and selected cards move 2px on pointer hover; reduced motion disables
  these transitions. Keyboard focus keeps its visible outline.
- Portfolio headings use clamp(2rem,4vw,3.2rem), line-height 1.15. Source Sans 3
  remains the interface/body face. Existing local Source Serif 4 italic is used
  only for the home headline accent and the about-section closing paragraph.
- The original portrait has a subtle copper/green circular frame and CSS edge
  mask. It remains at most 240px on desktop and 190px on mobile. No facial
  retouching or replacement was performed.
- Fine contours, a mint/copper dashed route and small reference nodes form one
  continuous background. Section colors remain distinct. Decorative elements
  are static, aria-hidden and cannot capture clicks.
- All eight routes use locale-specific 1200×630 PNG sharing cards, their SVG
  source, Open Graph image/locale metadata and Twitter large-image metadata.
  The existing lm. favicon was updated to the current palette, using vector
  outlines from the licensed local Source Sans 3 font rather than remote fonts.
  Actual social-platform unfurling remains NOT_EXECUTED until publication.
- Production portrait/product assets remain external WebP files. Base64 is
  confined to the portable, offline preview. No image-provider integration was
  added. Social PNGs were rendered from repository-native vector artwork.
- A creation card links the public portfolio implementation and its checks.
  Private project repositories and unpublished materials are not public proof.
  Reta Final remains an upcoming product, without an invented demo, sample,
  checkout or production result.
- A hero contact link reaches the existing contact section. Email and clipboard
  actions are deferred until the owner specifies an address for public use.
  The privacy policy's substantive wording is unchanged.

Reproduction: `npm ci --ignore-scripts`, `npm run build`, `npm run test:static`,
`npx playwright install --with-deps chromium`, `npm run test:e2e`,
`npm run test:fresh-eyes`, `npm run test:relay`. The PR workflow additionally
runs the existing desktop/mobile Lighthouse gates. Browser runs are performed
in GitHub Actions; local build/static checks are supplementary. Contrast
assertions retain the 4.5:1 minimum; Lighthouse is not a formal a11y audit.
