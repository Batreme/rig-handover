import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../src/app.js';
import type { DigestRow } from '../src/digest/types.js';

describe('digest routes (2a & 2b)', () => {
  let tempRunsDir: string;
  let app: ReturnType<typeof createApp>;

  beforeAll(() => {
    tempRunsDir = mkdtempSync(join(tmpdir(), 'rig-runs-test-'));

    // 1. Normal night with valid runs
    writeFileSync(
      join(tempRunsDir, '2026-10-01.jsonl'),
      [
        JSON.stringify({ at: '2026-10-01T01:00:00Z', job: 'job/a', status: 'ok', owner: 'alice' }),
        JSON.stringify({ at: '2026-10-01T02:00:00Z', job: 'job/b', status: 'retry', owner: 'bob', error: 'e1' }),
      ].join('\n'),
    );

    // 2. Empty night file
    writeFileSync(join(tempRunsDir, '2026-10-02.jsonl'), '');

    // 3. Night with a bad unparseable line
    writeFileSync(
      join(tempRunsDir, '2026-10-03.jsonl'),
      [
        JSON.stringify({ at: '2026-10-03T01:00:00Z', job: 'job/c', status: 'ok', owner: 'charlie' }),
        'NOT_A_VALID_JSON_OBJECT',
      ].join('\n'),
    );

    app = createApp({
      adapter: 'test',
      installed: '2026-10-01T00:00:00Z',
      beatEverySeconds: 60,
      runsDir: tempRunsDir,
    });
  });

  afterAll(() => {
    rmSync(tempRunsDir, { recursive: true, force: true });
  });

  describe('GET /digest/:night (2a page)', () => {
    it('returns 200 and renders rows for a normal night', async () => {
      const res = await app.request('/digest/2026-10-01');
      expect(res.status).toBe(200);
      const html = await res.text();
      expect(html).toContain('job/a');
      expect(html).toContain('job/b');
      expect(html).toContain('alice');
    });

    it('returns 404 for a night with no file', async () => {
      const res = await app.request('/digest/2026-10-99');
      expect(res.status).toBe(404);
    });

    it('returns 200 and renders "nothing ran" for an empty night', async () => {
      const res = await app.request('/digest/2026-10-02');
      expect(res.status).toBe(200);
      const html = await res.text();
      expect(html).toContain('nothing ran');
    });

    it('returns 200 and renders valid rows despite a bad line', async () => {
      const res = await app.request('/digest/2026-10-03');
      expect(res.status).toBe(200);
      const html = await res.text();
      expect(html).toContain('job/c');
      expect(html).toContain('1 unparseable line');
    });
  });

  describe('GET /api/digest/:night (2b JSON)', () => {
    it('returns 200 and row list for a normal night', async () => {
      const res = await app.request('/api/digest/2026-10-01');
      expect(res.status).toBe(200);
      const rows: DigestRow[] = await res.json();
      expect(rows.length).toBe(2);
      expect(rows[0].job).toBe('job/a');
      expect(rows[1].job).toBe('job/b');
    });

    it('returns 404 for a night with no file', async () => {
      const res = await app.request('/api/digest/2026-10-99');
      expect(res.status).toBe(404);
    });

    it('returns 200 and empty array for an empty night', async () => {
      const res = await app.request('/api/digest/2026-10-02');
      expect(res.status).toBe(200);
      const rows: DigestRow[] = await res.json();
      expect(rows).toEqual([]);
    });

    it('returns 200 and valid rows ignoring bad line', async () => {
      const res = await app.request('/api/digest/2026-10-03');
      expect(res.status).toBe(200);
      const rows: DigestRow[] = await res.json();
      expect(rows.length).toBe(1);
      expect(rows[0].job).toBe('job/c');
    });
  });
});
