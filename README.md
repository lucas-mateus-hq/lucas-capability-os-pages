# Historical portfolio source and old-address forwarding

The active personal website has moved to https://lucas-mateus-hq.github.io/ and source is maintained at https://github.com/lucas-mateus-hq/lucas-mateus-hq.github.io.

This repository preserves the previous source/history and publishes only eight explicit forwarding pages. Queries and fragments are preserved by JavaScript; a no-JavaScript refresh and accessible destination link remain. These are static browser redirects, not HTTP 301/308 responses.

Legacy Relay/protocol and product assets are not published here. `node scripts/build-migration-redirects.mjs` builds forwarding pages; `node --test tests/migration.test.mjs` validates mapping and retirement. CI checks actual Chromium redirects with intercepted destination probes; the deployment receipt separately verifies real destination responses, old-page metadata and 404 retirement.
