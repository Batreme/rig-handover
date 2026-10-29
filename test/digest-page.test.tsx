import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

const config = { adapter: 'shim', installed: '2026-10-29', beatEverySeconds: 60, runsDir: 'runs' };

describe('digest page', () => {
  it('renders /digest/2026-10-28 locally', async () => {
    const res = await createApp(config).request('/digest/2026-10-28');
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('digest · 2026-10-28');
    expect(html).toContain('digest/render');
    expect(html).toContain('notes/backup');
    expect(html).toContain('quota exceeded');
  });

  it('returns 404 for missing night', async () => {
    const res = await createApp(config).request('/digest/1999-01-01');
    expect(res.status).toBe(404);
  });
});
