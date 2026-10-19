// Közös listák, amiket a kliens és a szerver is használ.

export const STATUSES = {
  want: "Olvasni szeretném",
  reading: "Olvasom",
  finished: "Elolvastam",
};

export const FORMATS = {
  physical: "Nyomtatott",
  ebook: "E-könyv",
  audio: "Hangoskönyv",
};

// Műfajok, és hogy az Open Library angol "subject" címkéi közül melyik melyikre utal.
// A sorrend számít: az első egyező műfajt javasoljuk.
export const GENRES = [
  { key: "fantasy", label: "Fantasy", match: ["fantasy", "magic", "dragons"] },
  { key: "scifi", label: "Sci-fi", match: ["science fiction", "dystopia", "space"] },
  { key: "thriller", label: "Thriller", match: ["thriller", "suspense"] },
  { key: "crime", label: "Krimi", match: ["detective", "mystery", "crime", "murder"] },
  { key: "horror", label: "Horror", match: ["horror", "ghost"] },
  { key: "romance", label: "Romantikus", match: ["romance", "love stories"] },
  { key: "historical", label: "Történelmi", match: ["historical fiction", "history"] },
  { key: "biography", label: "Életrajz", match: ["biography", "autobiography", "memoir"] },
  { key: "selfhelp", label: "Önfejlesztés", match: ["self-help", "self-actualization", "success", "habit"] },
  { key: "nonfiction", label: "Ismeretterjesztő", match: ["science", "psychology", "philosophy", "economics"] },
  { key: "poetry", label: "Vers", match: ["poetry", "poems"] },
  { key: "youth", label: "Ifjúsági", match: ["juvenile", "young adult", "children"] },
  { key: "classic", label: "Klasszikus", match: ["classic"] },
  { key: "fiction", label: "Szépirodalom", match: ["fiction", "novel"] },
];

export const GENRE_LABELS = Object.fromEntries(GENRES.map((g) => [g.key, g.label]));

export function guessGenre(subjects = []) {
  const text = subjects.join(" | ").toLowerCase();
  return GENRES.find((g) => g.match.some((m) => text.includes(m)))?.key ?? null;
}
