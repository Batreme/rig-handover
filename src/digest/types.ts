export type DigestRow = {
  job: string;
  owner: string;
  runs: number;
  retries: number;
  lastStatus: 'ok' | 'retry' | 'fail' | string;
  lastError: string | null;
  firstTime: string;
  lastTime: string;
};

export type NightDigest = {
  night: string;
  rows: DigestRow[];
  badLines: number;
  counts: {
    ok: number;
    retry: number;
    fail: number;
  };
};

export type ReadNightFn = (runsDir: string, night: string) => NightDigest | null;
