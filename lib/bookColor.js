// Könyvek színei a polcon.

const SPINE_COUNT = 8;

// Tartalék szín azoknak a könyveknek, amiknek nincs borítója (vagy még nem számoltuk ki):
// az azonosító alapján mindig ugyanaz a palettaszín.
export function fallbackSpineColor(id = "") {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return `var(--spine-${(Math.abs(hash) % SPINE_COUNT) + 1})`;
}

export function spineColor(book) {
  return book.spineColor ?? fallbackSpineColor(book.id ?? book.title);
}

// Olvasható szövegszín egy háttérszínhez: világos háttéren sötét, sötéten világos.
// A tartalék palettaszínek mind világosak, azokra sötét szöveg kerül.
export function spineTextColor(book) {
  const hex = book.spineColor;
  if (!hex) return "#1e1714";
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.55 ? "#1e1714" : "#f5efe8";
}
