import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

const config = { adapter: 'shim', installed: '2026-10-29', beatEverySeconds: 60, runsDir: 'runs' };

describe('board link', () => {
  it('both nights on disk link to a digest that renders', async () => {
    const app = createApp(config);
    const statusRes = await app.request('/');
    expect(statusRes.status).toBe(200);
    const html = await statusRes.text();

    expect(html).toContain('<a href="/digest/2026-10-28">2026-10-28</a>');
    expect(html).toContain('<a href="/digest/2026-10-27">2026-10-27</a>');

    expect(html).toContain('10 ok · 4 retry');
    expect(html).toContain('1 fail');

    expect(html).toContain('7 ok · 0 retry · 0 fail');

    const res28 = await app.request('/digest/2026-10-28');
    expect(res28.status).toBe(200);
    expect(await res28.text()).toContain('digest · 2026-10-28');

    const res27 = await app.request('/digest/2026-10-27');
    expect(res27.status).toBe(200);
    expect(await res27.text()).toContain('digest · 2026-10-27');
  });
});
