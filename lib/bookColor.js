// Minden könyv kap egy állandó "gerincszínt" az azonosítója alapján,
// így a polcon és a grafikonokon mindig ugyanazzal a színnel jelenik meg.
const SPINE_COUNT = 8;

export function spineColor(id = "") {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return `var(--spine-${(Math.abs(hash) % SPINE_COUNT) + 1})`;
}
