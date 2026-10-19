// A dashboard számításai. Tiszta függvények: könyvlistát kapnak, számokat adnak vissza.
import { GENRE_LABELS, STATUSES } from "./constants";

export const MONTHS = ["jan.", "febr.", "márc.", "ápr.", "máj.", "jún.", "júl.", "aug.", "szept.", "okt.", "nov.", "dec."];

// Hány elemből áll a műfaj-diagram; a többi "Egyéb" lesz (sok szelet olvashatatlan)
const MAX_GENRE_SLICES = 5;

export function totals(books) {
  const count = (status) => books.filter((b) => b.status === status).length;
  return {
    all: books.length,
    finished: count("finished"),
    want: count("want"),
    reading: count("reading"),
    pagesRead: books.reduce((sum, b) => sum + (b.currentPage || 0), 0),
  };
}

// A leggyakoribb érték egy tulajdonság szerint, pl. legtöbbször előforduló szerző
function top(values) {
  const counts = new Map();
  for (const v of values) if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
  let best = null;
  for (const [value, n] of counts) if (!best || n > best.count) best = { value, count: n };
  return best;
}

export function highlights(books) {
  const genre = top(books.map((b) => b.genre));
  const author = top(books.flatMap((b) => b.authors));
  const longest = books.filter((b) => b.totalPages).sort((a, b) => b.totalPages - a.totalPages)[0];
  return {
    genre: genre && { label: GENRE_LABELS[genre.value], count: genre.count },
    author: author && { label: author.value, count: author.count },
    longest: longest && { label: longest.title, count: longest.totalPages, id: longest.id },
  };
}

// Havi bontás egy adott évre: hány könyvet kezdtem el és fejeztem be
export function monthlySummary(books, year) {
  const months = MONTHS.map((label) => ({ label, started: 0, finished: 0 }));
  for (const b of books) {
    if (b.startedAt?.startsWith(`${year}-`)) months[Number(b.startedAt.slice(5, 7)) - 1].started++;
    if (b.finishedAt?.startsWith(`${year}-`)) months[Number(b.finishedAt.slice(5, 7)) - 1].finished++;
  }
  return months;
}

// Azok az évek, amikből van kezdési/befejezési dátum (+ az aktuális év)
export function yearsWithData(books, currentYear) {
  const years = new Set([currentYear]);
  for (const b of books) {
    for (const d of [b.startedAt, b.finishedAt]) if (d) years.add(Number(d.slice(0, 4)));
  }
  return [...years].sort((a, b) => b - a);
}

// Műfajok megoszlása: a leggyakoribbak külön szeletként, a többi "Egyéb"
export function genreBreakdown(books) {
  const counts = new Map();
  for (const b of books) {
    const key = b.genre ?? null;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const known = [...counts].filter(([key]) => key).sort((a, b) => b[1] - a[1]);
  const slices = known.slice(0, MAX_GENRE_SLICES).map(([key, count]) => ({ key, label: GENRE_LABELS[key], count }));
  const rest = known.slice(MAX_GENRE_SLICES).reduce((sum, [, n]) => sum + n, 0) + (counts.get(null) ?? 0);
  if (rest > 0) slices.push({ key: "other", label: "Egyéb / nincs megadva", count: rest });
  return slices;
}

// Státuszok megoszlása – sorrend: elolvasott, olvasott, váró (a színek így különülnek el)
export function statusBreakdown(books) {
  return ["finished", "reading", "want"].map((key) => ({
    key,
    label: STATUSES[key],
    count: books.filter((b) => b.status === key).length,
  }));
}
