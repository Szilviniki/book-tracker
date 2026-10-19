import "server-only";
import sharp from "sharp";

// Egy borítókép jellemző színe, a könyvgerinchez.
// A képet pici méretre kicsinyítjük, a pixeleket színcsoportokba soroljuk, és azt a
// csoportot választjuk, amelyik a leggyakoribb – a színesebbek kicsit előnyt kapnak,
// hogy egy fehér margó vagy fekete betű ne "nyerjen" egy színes borító helyett.
export async function coverColor(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return null;
    const { data } = await sharp(Buffer.from(await res.arrayBuffer()))
      .resize(24, 36, { fit: "cover" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const buckets = new Map();
    for (let i = 0; i < data.length; i += 3) {
      const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
      const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4); // 16 árnyalat csatornánként
      const bucket = buckets.get(key) ?? { r: 0, g: 0, b: 0, n: 0 };
      bucket.r += r;
      bucket.g += g;
      bucket.b += b;
      bucket.n += 1;
      buckets.set(key, bucket);
    }

    let best = null;
    let bestScore = -1;
    for (const { r, g, b, n } of buckets.values()) {
      const color = [r / n, g / n, b / n];
      const score = n * (0.35 + saturation(color));
      if (score > bestScore) {
        bestScore = score;
        best = color;
      }
    }
    return best ? toHex(best) : null;
  } catch {
    return null; // nem elérhető kép, ismeretlen formátum stb.
  }
}

function saturation([r, g, b]) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

function toHex(rgb) {
  return `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;
}
