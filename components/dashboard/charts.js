// A dashboard grafikonjai. Szerveroldali komponensek, JavaScript nélkül: a jelölők
// natív buborékot (<title>) kapnak, minden érték olvasható felirattal vagy táblázatban is.

const pct = (n, total) => (total ? Math.round((n / total) * 100) : 0);

function Swatch({ color }) {
  return <span className="inline-block size-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: color }} />;
}

// Lenyitható táblázat – az adatok grafikon nélkül is elérhetők
function DataTable({ caption, headers, rows }) {
  return (
    <details className="mt-3 text-xs text-muted">
      <summary className="cursor-pointer select-none hover:text-fg">Táblázat</summary>
      <table className="mt-2 w-full tabular-nums lining-nums">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="text-faint">
            {headers.map((h, i) => (
              <th key={h} scope="col" className={`py-1 font-normal ${i ? "text-right" : "text-left"}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]} className="border-t border-line">
              {row.map((cell, i) => (
                <td key={i} className={`py-1 ${i ? "text-right text-fg" : ""}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

// Havi összesítő: soronként egy hónap, két vékony sáv (elkezdett / befejezett)
export function MonthlyBars({ months, year }) {
  const max = Math.max(1, ...months.flatMap((m) => [m.started, m.finished]));
  const series = [
    { key: "started", label: "Elkezdett", color: "var(--status-reading)" },
    { key: "finished", label: "Befejezett", color: "var(--status-finished)" },
  ];

  return (
    <div>
      <div className="mb-3 flex gap-4 text-xs text-muted">
        {series.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <Swatch color={s.color} /> {s.label}
          </span>
        ))}
      </div>
      <ul className="flex flex-col gap-1.5">
        {months.map((m) => (
          <li
            key={m.label}
            title={`${year}. ${m.label} – elkezdett: ${m.started}, befejezett: ${m.finished}`}
            className="grid grid-cols-[3rem_minmax(0,1fr)] items-center gap-2 rounded px-1 py-0.5 hover:bg-surface-2"
          >
            <span className="text-xs text-muted">{m.label}</span>
            <span className="flex flex-col gap-0.5">
              {series.map((s) => (
                <span key={s.key} className="flex h-2 items-center gap-1.5">
                  {m[s.key] > 0 && (
                    <span
                      className="h-full rounded-r-[4px]"
                      style={{ width: `${(m[s.key] / max) * 85}%`, backgroundColor: s.color }}
                    />
                  )}
                  {m[s.key] > 0 && <span className="text-[0.65rem] leading-none text-muted tabular-nums lining-nums">{m[s.key]}</span>}
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>
      <DataTable
        caption={`Havi összesítő, ${year}`}
        headers={["Hónap", "Elkezdett", "Befejezett"]}
        rows={months.map((m) => [m.label, m.started, m.finished])}
      />
    </div>
  );
}

const GENRE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

// Műfajok megoszlása fánkdiagramon (legfeljebb 5 szelet + Egyéb), mellette jelmagyarázat
export function GenreDonut({ slices }) {
  const total = slices.reduce((sum, s) => sum + s.count, 0);
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const gap = slices.length > 1 ? 2.5 : 0; // 2px-es rés a szeletek között

  // Minden szelet hossza és kezdőpontja a körön (az előző szeletek összege)
  const colored = slices.map((s, i) => {
    const before = slices.slice(0, i).reduce((sum, p) => sum + p.count, 0);
    return {
      ...s,
      color: s.key === "other" ? "var(--chart-other)" : GENRE_COLORS[i % GENRE_COLORS.length],
      length: (s.count / total) * circumference,
      offset: (before / total) * circumference,
    };
  });

  return (
    <div>
      <div className="flex items-center gap-5">
        <svg viewBox="0 0 120 120" className="size-32 shrink-0" role="img" aria-label="Műfajok megoszlása">
          {/* a szeletek 12 órától indulnak */}
          <g transform="rotate(-90 60 60)">
          {colored.map((s) => (
              <circle
                key={s.key}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={s.color}
                strokeWidth="16"
                strokeDasharray={`${Math.max(0, s.length - gap)} ${circumference}`}
                strokeDashoffset={-s.offset}
                className="transition-opacity hover:opacity-80"
              >
                <title>{`${s.label}: ${s.count} könyv (${pct(s.count, total)}%)`}</title>
              </circle>
          ))}
          </g>
          <text x="60" y="60" textAnchor="middle" dominantBaseline="central" className="fill-fg font-display text-2xl">
            {total}
          </text>
        </svg>
        <ul className="flex min-w-0 flex-col gap-1.5 text-xs">
          {colored.map((s) => (
            <li key={s.key} className="flex items-center gap-2">
              <Swatch color={s.color} />
              <span className="truncate text-muted">{s.label}</span>
              <span className="ml-auto pl-2 text-fg tabular-nums lining-nums">{s.count}</span>
              <span className="w-8 text-right text-faint tabular-nums lining-nums">{pct(s.count, total)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const STATUS_COLORS = {
  finished: "var(--status-finished)",
  reading: "var(--status-reading)",
  want: "var(--status-want)",
};

// Státuszok megoszlása egyetlen, szakaszokra osztott sávon
export function StatusBar({ parts }) {
  const total = parts.reduce((sum, p) => sum + p.count, 0);
  const visible = parts.filter((p) => p.count > 0);

  return (
    <div>
      <div className="flex h-3 gap-0.5 overflow-hidden rounded-[4px]">
        {visible.map((p) => (
          <span
            key={p.key}
            title={`${p.label}: ${p.count} könyv (${pct(p.count, total)}%)`}
            style={{ width: `${(p.count / total) * 100}%`, backgroundColor: STATUS_COLORS[p.key] }}
            className="h-full transition-opacity hover:opacity-80"
          />
        ))}
      </div>
      <ul className="mt-3 flex flex-col gap-1.5 text-xs">
        {parts.map((p) => (
          <li key={p.key} className="flex items-center gap-2">
            <Swatch color={STATUS_COLORS[p.key]} />
            <span className="text-muted">{p.label}</span>
            <span className="ml-auto text-fg tabular-nums lining-nums">{p.count}</span>
            <span className="w-8 text-right text-faint tabular-nums lining-nums">{pct(p.count, total)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
