import Link from "next/link";
import { spineColor } from "@/lib/bookColor";

// Könyvgerincek egy polcon. A gerinc magassága és vastagsága az oldalszámtól függ.
export default function Shelf({ books }) {
  if (books.length === 0) return null;

  return (
    <div className="relative">
      <div className="flex items-end gap-1 overflow-x-auto px-2 pt-2">
        {books.map((book) => {
          const pages = book.totalPages || 300;
          const height = 120 + Math.round(((book.title.length * 7) % 5) * 6); // kis változatosság
          const width = Math.min(48, Math.max(26, Math.round(pages / 14)));
          return (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              title={`${book.title}${book.authors[0] ? ` – ${book.authors[0]}` : ""}`}
              style={{ height, width, backgroundColor: spineColor(book.id) }}
              className="group relative flex shrink-0 items-center justify-center rounded-t-[3px] text-[#1e1714] transition duration-300 hover:-translate-y-2"
            >
              <span className="absolute inset-x-0 top-2.5 mx-auto h-px w-3/5 bg-black/15" />
              <span className="absolute inset-x-0 bottom-2.5 mx-auto h-px w-3/5 bg-black/15" />
              <span className="max-h-[80%] overflow-hidden text-ellipsis whitespace-nowrap font-display text-[0.7rem] [writing-mode:vertical-rl] rotate-180">
                {book.title}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="h-2.5 rounded-sm bg-line-strong shadow-[0_6px_14px_-4px_rgba(0,0,0,0.6)]" />
    </div>
  );
}
