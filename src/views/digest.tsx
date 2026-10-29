import type { DigestRow } from '../digest/types.js';

export function DigestView({
  night,
  rows,
  badLines,
}: {
  night: string;
  rows: DigestRow[];
  badLines: number;
}) {
  return (
    <>
      <nav>
        <a href="/" class="mute">← status board</a>
      </nav>
      <h1>digest · {night}</h1>
      {rows.length === 0 ? (
        <p class="mute">nothing ran</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>job</th>
              <th>owner</th>
              <th>runs</th>
              <th>retries</th>
              <th>status</th>
              <th>error</th>
              <th>first</th>
              <th>last</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.job}>
                <td>{row.job}</td>
                <td>{row.owner}</td>
                <td>{row.runs}</td>
                <td class={row.retries >= 3 ? 'warn' : undefined}>{row.retries}</td>
                <td class={row.lastStatus === 'fail' ? 'warn' : undefined}>{row.lastStatus}</td>
                <td class={row.lastError ? 'warn' : 'mute'}>{row.lastError ?? '—'}</td>
                <td>{row.firstTime}</td>
                <td>{row.lastTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {badLines > 0 && (
        <p class="mute">
          {badLines} unparseable line{badLines === 1 ? '' : 's'}
        </p>
      )}
    </>
  );
}
