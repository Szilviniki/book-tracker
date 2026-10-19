import "server-only";
import { after } from "next/server";
import { booksMissingSpineColor, setSpineColor } from "./books";
import { coverColor } from "./coverColor";

let running = null;

// Kiszámolja és elmenti a még hiányzó gerincszíneket. A válasz elküldése UTÁN fut
// (after), így az oldal betöltését nem lassítja; a színek a következő megnyitáskor látszanak.
export function fillSpineColorsLater() {
  after(() => {
    running ??= fill().finally(() => (running = null));
    return running;
  });
}

async function fill() {
  const books = booksMissingSpineColor();
  // Egyszerre legfeljebb 4 borítót töltünk le
  for (let i = 0; i < books.length; i += 4) {
    await Promise.all(
      books.slice(i, i + 4).map(async (book) => setSpineColor(book.id, await coverColor(book.cover_url)))
    );
  }
}
