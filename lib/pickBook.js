// A "Mi legyen a következő?" választó logikája.

// Mely könyvek közül húzhatunk: alapból az "Olvasni szeretném" lista,
// újraolvasással az elolvasottak is. Műfaj megadásakor csak az adott műfajból.
export function candidatePool(books, { genre = "", reread = false } = {}) {
  return books.filter(
    (b) => (b.status === "want" || (reread && b.status === "finished")) && (!genre || b.genre === genre)
  );
}

// Véletlen könyv a listából; ha lehet, nem ugyanaz, mint az előző.
export function pickRandom(pool, previousId = null) {
  if (pool.length === 0) return null;
  const choices = pool.length > 1 ? pool.filter((b) => b.id !== previousId) : pool;
  return choices[Math.floor(Math.random() * choices.length)];
}
