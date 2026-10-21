# Public technical-route retirement

Founder request: remove technical content that does not belong in personal-site search results.

Removed from the Pages artifact: Relay HTML/JS/handoff, public protocol and schema, asset READMEs and unused SVG social-card sources. Asset authoring sources were moved to docs/asset-sources, which Astro does not publish. The former Relay/protocol source is recoverable through Git history. This public repository and its history remain publicly searchable; no confidentiality or global deletion is claimed.

Eight personal routes, LinkedIn-only contact, local font licenses, social PNG cards, privacy notice and product presentation remain. Privacy copy no longer advertises a live Relay. Private LinkedIn publishing notice remains because it serves an existing integration.

No robots disallow was added: removed URLs should return 404 so crawlers can observe retirement. The project robots.txt is below the hostname root and must not be treated as a host-wide crawler policy. No search-engine removal request or Search Console account change was performed.

Validation: build/static checks, existing personal journeys/geometry/Lighthouse gates, four HTTP retirement cases, and release-SHA-checked publication smoke tests. The live receipt records every retired path with an expected 404.
