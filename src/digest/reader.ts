import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { DigestRow, NightDigest } from './types.js';

export function readNight(runsDir: string, night: string): NightDigest | null {
  const filePath = join(runsDir, `${night}.jsonl`);
  if (!existsSync(filePath)) {
    return null;
  }

  let content: string;
  try {
    content = readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }

  if (content.trim().length === 0) {
    return {
      night,
      rows: [],
      badLines: 0,
    };
  }

  const lines = content.split('\n');
  const jobs = new Map<string, DigestRow>();
  let badLines = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    let parsed: any;
    try {
      parsed = JSON.parse(line);
    } catch {
      badLines++;
      continue;
    }

    if (!parsed || typeof parsed !== 'object' || !parsed.job || !parsed.at || !parsed.status) {
      badLines++;
      continue;
    }

    const jobName = String(parsed.job);
    const existing = jobs.get(jobName);

    if (!existing) {
      jobs.set(jobName, {
        job: jobName,
        owner: parsed.owner != null && String(parsed.owner).trim() !== '' ? String(parsed.owner) : '—',
        runs: 1,
        retries: parsed.status === 'retry' ? 1 : 0,
        lastStatus: String(parsed.status),
        lastError: parsed.error != null ? String(parsed.error) : null,
        firstTime: String(parsed.at),
        lastTime: String(parsed.at),
      });
    } else {
      existing.runs += 1;
      if (parsed.status === 'retry') {
        existing.retries += 1;
      }
      if (parsed.owner != null && String(parsed.owner).trim() !== '') {
        existing.owner = String(parsed.owner);
      }
      existing.lastStatus = String(parsed.status);
      existing.lastError = parsed.error != null ? String(parsed.error) : null;
      existing.lastTime = String(parsed.at);
    }
  }

  const sortedRows = Array.from(jobs.values()).sort((a, b) => a.job.localeCompare(b.job));

  return {
    night,
    rows: sortedRows,
    badLines,
  };
}
