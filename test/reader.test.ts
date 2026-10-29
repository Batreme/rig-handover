import { describe, expect, it } from 'vitest';
import { readNight } from '../src/digest/index.js';

describe('reader', () => {
  it('reads runs/2026-10-28.jsonl with 5 jobs and 1 bad line', () => {
    const digest = readNight('runs', '2026-10-28');
    expect(digest).not.toBeNull();
    expect(digest!.rows.length).toBe(5);
    expect(digest!.badLines).toBe(1);

    const jobs = digest!.rows.map((r) => r.job);
    expect(jobs).toEqual([
      'digest/render',
      'fixtures/refresh',
      'lane/sync',
      'notes/backup',
      'rig/rotate-logs',
    ]);

    const nullOwnerJob = digest!.rows.find((r) => r.job === 'digest/render');
    expect(nullOwnerJob?.owner).toBe('—');
    expect(nullOwnerJob?.runs).toBe(1);
    expect(nullOwnerJob?.retries).toBe(0);
    expect(nullOwnerJob?.lastStatus).toBe('ok');
    expect(nullOwnerJob?.lastError).toBeNull();

    const retriedJob = digest!.rows.find((r) => r.job === 'fixtures/refresh');
    expect(retriedJob?.owner).toBe('rook');
    expect(retriedJob?.runs).toBe(4);
    expect(retriedJob?.retries).toBe(3);
    expect(retriedJob?.lastStatus).toBe('ok');

    const failedJob = digest!.rows.find((r) => r.job === 'notes/backup');
    expect(failedJob?.owner).toBe('lane-07');
    expect(failedJob?.runs).toBe(1);
    expect(failedJob?.retries).toBe(0);
    expect(failedJob?.lastStatus).toBe('fail');
    expect(failedJob?.lastError).toBe('quota exceeded');
  });

  it('returns null for missing night', () => {
    expect(readNight('runs', '1999-01-01')).toBeNull();
  });
});
