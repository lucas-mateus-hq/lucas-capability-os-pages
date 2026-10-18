# Personal site — UX, UI and information architecture review

Date: 2026-10-18. Scope: candidate preview in PR #28; no publication.

## Method and limits

Heuristic review grounded in the publications below, followed by source/build and automated browser checks. Audience hypotheses come from the approved site purpose, not interviews: recruiters assessing experience; people interested in Reta Final; contacts learning about Lucas. No visitor interviews, human usability sessions, analytics, conversion experiment or formal accessibility conformance audit performed. Color decisions express the requested slate identity; no universal psychological effect or conversion improvement is claimed.

## Journey and information architecture

Primary journey: home → professional portfolio (English disclosed before click) → experience/evidence → contact via LinkedIn. Secondary journey: home → creations → Reta Final detail → upcoming status and what it offers. Personal discovery: home → about → LinkedIn. Home order matches navigation: work, creations, about, contact, with an ideas section between creations and about. Existing direct URLs/anchors remain.

Removed the navigation promise of an article collection: there are no supplied published articles/books to list. The ideas section now explicitly links to a LinkedIn profile. No empty future categories, invented publications, waitlist or sales destination added. The Reta Final link names its destination; product status remains explicit.

## Findings and implementation

| Finding | Principle | Change |
| --- | --- | --- |
| Poetic hero needed a concrete explanation | Match with real world; information scent | Intro identifies experience, Reta Final and emerging projects |
| Work navigation preceded creations but document reversed them | Consistency; spatial order | Work first; numbered sections match reading order |
| English destination was a surprise after primary CTA | Predictable links | Language note beside hero CTA, explicit portfolio labels elsewhere |
| Escritos implied a collection not provided | Accurate labels; information architecture | No collection menu item; ideas section identifies actual LinkedIn destination |
| Generic product link relied on context | Information scent | Link explicitly names Reta Final |
| Small navigation/footer/inline action targets | WCAG 2.5.8; touch usability | 44px minimum height for these controls; mobile spacing retained |
| Small labels and wide prose reduced reading comfort | Readability and visual hierarchy | Larger labels/link type, 65ch prose cap; consistent slate/mint/gold hierarchy |
| Skip destination had no explicit focus target | Keyboard navigation | Focusable main and visible focus styling |
| Text customization could invalidate fixed layouts | Reflow and text spacing | Browser test for custom text spacing on home and product |

WCAG target minimum AA is 24×24 CSS pixels subject to exceptions; 44px here is a deliberate design target, not a claim that every inline link universally requires 44px. Reduced motion, native links, no-JavaScript functionality and existing contrast checks remain. No sticky header obscures anchors. No new dependencies or trackers.

## References consulted

- Nielsen, *10 Usability Heuristics for User Interface Design*: https://www.nngroup.com/articles/ten-usability-heuristics/
- Budiu (2020), *Information Scent: How Users Decide Where to Go Next*: https://www.nngroup.com/articles/information-scent/
- W3C, WCAG 2.2 Understanding Target Size (Minimum): https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- W3C, WCAG 2.2 Understanding Reflow: https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
- W3C, WCAG 2.2 Understanding Text Spacing: https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html

These support design decisions; they do not establish that this specific site has been validated with its audience.

## Small human validation to run next

Recruit several representative visitors, with consent and no personal-data collection by default. Ask without pointing to labels: find evidence of Lucas's recruiting experience; determine what Reta Final is and whether it is available; find how to contact him. Observe first click, completion without assistance, unexpected language/status and verbal confusion. Ask what they believe Lucas does after a brief view. Use observations to revise labels/sequence; do not claim population-level conversion rates from this small exercise.

## Reproducible verification

`npm ci --ignore-scripts --no-audit --no-fund`; `npm run build`; `npm run test:static`. GitHub runner executes `npm run test:e2e`, `npm run test:fresh-eyes`, unchanged relay regression and unchanged desktop/mobile Lighthouse gates. New browser scenarios cover navigation order/language cues, 44px home controls, actual skip focus and text-spacing resilience. Managed Work has no control-browser skill, so local browser QA is NOT_EXECUTED. CI results must be reported from the actual run; prior version's results are not evidence for this revision.

First real CI execution passed six journey tests but exposed horizontal overflow at 320px with increased text spacing. The mobile hero used an automatic minimum grid track; its long heading could force the track beyond the viewport. The hero now has a zero-minimum mobile track and shrinkable children. The text-spacing assertion is retained, with geometry diagnostics added.
