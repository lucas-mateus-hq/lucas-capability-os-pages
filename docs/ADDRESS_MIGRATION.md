# Personal-site address migration

Root site: https://lucas-mateus-hq.github.io/
New source: https://github.com/lucas-mateus-hq/lucas-mateus-hq.github.io

The former eight personal routes map one-to-one to root routes. Publish this forwarding version only after the new root release passes its live verification. The old build now contains forwarding HTML only, plus deployment.json; no copied assets, Relay or protocol. Existing source is preserved for history, but new portfolio edits belong in the new repository.

Redirect tests: nine deterministic mapping/absence cases, eight actual Chromium redirect journeys with destination probes (not a claim of live remote integration), four retired-route HTTP cases. Post-deployment receipt checks old metadata and all eight actual destination responses. GitHub Pages serves these forwarding pages as HTTP 200, with client-side navigation and canonical/noindex metadata; no server redirect is claimed.
