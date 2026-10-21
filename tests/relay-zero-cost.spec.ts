import { test, expect } from '@playwright/test';

// Retirement replaces the old live Relay contract. Its implementation is recoverable in git history.
for (const path of ['relay/', 'relay/app.js', 'protocol/CAPABILITY_EVIDENCE_PROTOCOL_v0.1.md', 'protocol/capability-evidence-receipt.schema.json']) {
  test(`retired technical route is unavailable: ${path}`, async ({ request }) => {
    const response = await request.get(path);
    expect(response.status()).toBe(404);
    expect(await response.text()).not.toContain('caplab.relay.self.v1');
  });
}
