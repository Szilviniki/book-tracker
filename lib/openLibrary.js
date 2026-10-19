import "server-only";
import { cacheLife } from "next/cache";
import { guessGenre } from "./constants";

// Könyvkeresés az ingyenes Open Library API-val (nem kell hozzá kulcs).
// https://openlibrary.org/dev/docs/api/search
// A szerveren fut; ugyanarra a keresésre egy óráig a tárolt eredményt adjuk vissza.
export async function searchBooks(query) {
  "use cache";
  cacheLife("hours");

  const params = new URLSearchParams({
    q: query,
    limit: "12",
    fields: "key,title,author_name,cover_i,number_of_pages_median,first_publish_year,subject",
  });
  const res = await fetch(`https://openlibrary.org/search.json?${params}`);
  if (!res.ok) throw new Error(`Open Library hiba: ${res.status}`);
  const data = await res.json();

  return data.docs.map((doc) => ({
    title: doc.title,
    authors: doc.author_name ?? [],
    coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : null,
    totalPages: doc.number_of_pages_median ?? null,
    year: doc.first_publish_year ?? null,
    genre: guessGenre(doc.subject),
    source: { type: "openlibrary", key: doc.key },
  }));
}
