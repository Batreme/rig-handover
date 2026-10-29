import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import type { DigestRow } from '../src/digest/types.js';

const config = { adapter: 'shim', installed: '2026-10-29', beatEverySeconds: 60, runsDir: 'runs' };

describe('digest JSON API', () => {
  it('returns JSON for 2026-10-28 with same jobs in same order as the page', async () => {
    const app = createApp(config);
    const [pageRes, jsonRes] = await Promise.all([
      app.request('/digest/2026-10-28'),
      app.request('/api/digest/2026-10-28'),
    ]);

    expect(pageRes.status).toBe(200);
    expect(jsonRes.status).toBe(200);

    const html = await pageRes.text();
    const rows: DigestRow[] = await jsonRes.json();

    expect(rows.length).toBe(5);
    const expectedJobs = [
      'digest/render',
      'fixtures/refresh',
      'lane/sync',
      'notes/backup',
      'rig/rotate-logs',
    ];
    expect(rows.map((r) => r.job)).toEqual(expectedJobs);

    // Verify ordering matches HTML table
    let lastIndex = -1;
    for (const job of expectedJobs) {
      const idx = html.indexOf(`<td>${job}</td>`);
      expect(idx).toBeGreaterThan(lastIndex);
      lastIndex = idx;
    }
  });

  it('returns 404 for missing night JSON', async () => {
    const res = await createApp(config).request('/api/digest/1999-01-01');
    expect(res.status).toBe(404);
  });
});
