// Könyvek színei a polcon.
//
// A borítóból számolt színt (spineColor) nem közvetlenül használjuk, hanem az oldal
// gerincpalettájának hozzá legközelebbi színére igazítjuk: így a gerinc illik a
// borítóhoz (piros borító → terrakotta), de az egész polc egységes marad.

// Az app/globals.css --spine-1 … --spine-8 értékei (a kettőnek egyeznie kell)
const SPINE_PALETTE = ["#c77d67", "#5ea491", "#e99181", "#4196a2", "#d39d92", "#947c68", "#c09e67", "#907aa2"];

function hexToRgb(hex) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
}

// sRGB → OKLab: ebben a színtérben a távolság jól közelíti az emberi érzékelést
function toOklab(hex) {
  const [r, g, b] = hexToRgb(hex).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

const PALETTE_LAB = SPINE_PALETTE.map(toOklab);

// Ennél kevésbé színes borítónak (fekete, fehér, szürke) nincs igazi árnyalata
const NEUTRAL_CHROMA = 0.025;

const hueOf = (a, b) => Math.atan2(b, a);
const hueDistance = (h1, h2) => Math.abs(Math.atan2(Math.sin(h1 - h2), Math.cos(h1 - h2)));

// A palettából a színárnyalathoz legközelebbi elem sorszáma (a világosság nem számít:
// egy sötétkék borító is kék gerincet kapjon). Szürkés borítónál null.
function nearestPaletteIndex(hex) {
  const [, a, b] = toOklab(hex);
  if (Math.hypot(a, b) < NEUTRAL_CHROMA) return null;
  const hue = hueOf(a, b);
  let best = 0;
  PALETTE_LAB.forEach(([, pa, pb], i) => {
    if (hueDistance(hue, hueOf(pa, pb)) < hueDistance(hue, hueOf(PALETTE_LAB[best][1], PALETTE_LAB[best][2]))) best = i;
  });
  return best;
}

function hashIndex(text = "") {
  let hash = 0;
  for (const ch of text) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(hash) % SPINE_PALETTE.length;
}

// Egy könyv palettaszínének sorszáma: a borító árnyalatából; ha nincs borító, vagy
// az fekete/fehér/szürke, akkor az azonosítóból (így mindig ugyanazt kapja).
function paletteIndex(book) {
  return (book.spineColor && nearestPaletteIndex(book.spineColor)) ?? hashIndex(book.id ?? book.title);
}

function colorsFor(index) {
  const [r, g, b] = hexToRgb(SPINE_PALETTE[index]).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return {
    background: `var(--spine-${index + 1})`,
    // olvasható felirat: világos gerincen sötét, sötétebben világos
    text: luminance > 0.2 ? "#1e1714" : "#f5efe8",
  };
}

export function bookColors(book) {
  return colorsFor(paletteIndex(book));
}

// A polc színei: egy sorozat minden kötete ugyanazt a színt kapja
// (a sorozat legkisebb sorszámú, borítóval rendelkező kötetéből).
export function shelfColors(books) {
  const seriesIndex = new Map();
  const ordered = [...books].sort((a, b) => (a.seriesIndex ?? Infinity) - (b.seriesIndex ?? Infinity));
  for (const book of ordered) {
    if (!book.seriesName || seriesIndex.has(book.seriesName)) continue;
    const withCover = ordered.find((b) => b.seriesName === book.seriesName && b.spineColor);
    seriesIndex.set(book.seriesName, withCover ? paletteIndex(withCover) : hashIndex(book.seriesName));
  }
  return new Map(
    books.map((b) => [b.id, colorsFor(b.seriesName ? seriesIndex.get(b.seriesName) : paletteIndex(b))])
  );
}

// Sorozatok kötetei egymás mellé: az első előforduló kötet helyére kerül az egész
// sorozat, kötetszám szerint rendezve. A többi könyv sorrendje nem változik.
export function groupSeries(books) {
  const result = [];
  const placed = new Set();
  for (const book of books) {
    if (placed.has(book.id)) continue;
    const group = book.seriesName
      ? books
          .filter((b) => b.seriesName === book.seriesName)
          .sort((a, b) => (a.seriesIndex ?? Infinity) - (b.seriesIndex ?? Infinity))
      : [book];
    for (const b of group) {
      placed.add(b.id);
      result.push(b);
    }
  }
  return result;
}

export function seriesLabel(book) {
  if (!book.seriesName) return null;
  return book.seriesIndex != null ? `${book.seriesName} #${book.seriesIndex}` : book.seriesName;
}
