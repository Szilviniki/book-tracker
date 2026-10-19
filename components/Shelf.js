import Link from "next/link";
import { shelfColors, groupSeries, seriesLabel } from "@/lib/bookColor";

// Gerinc vastagsága az oldalszám alapján: kb. 100 oldal = vékony füzet,
// 800+ oldal = vaskos kötet. Ismeretlen oldalszámnál átlagos vastagság.
function spineWidth(pages) {
  if (!pages) return 34;
  return Math.round(Math.min(68, Math.max(16, 12 + pages / 11)));
}

// Könyvgerincek egy polcon: a szín a borítóhoz illő palettaszín, a vastagság az
// oldalszámból jön. Egy sorozat kötetei egymás mellett állnak, azonos színnel.
export default function Shelf({ books: unordered }) {
  if (unordered.length === 0) return null;
  const books = groupSeries(unordered);
  const colors = shelfColors(books);

  return (
    <div className="relative">
      <div className="flex items-end gap-1 overflow-x-auto px-2 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {books.map((book) => {
          // kis magasság-változatosság; egy sorozat kötetei egyforma magasak
          const height = 120 + Math.round((((book.seriesName ?? book.title).length * 7) % 5) * 6);
          const width = spineWidth(book.totalPages);
          const { background, text } = colors.get(book.id);
          return (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              title={[book.title, seriesLabel(book), book.authors[0], book.totalPages && `${book.totalPages} oldal`].filter(Boolean).join(" – ")}
              style={{ height, width, backgroundColor: background, color: text }}
              className="group relative flex shrink-0 items-center justify-center rounded-t-[3px] ring-1 ring-white/10 ring-inset shadow-[inset_-3px_0_6px_rgba(0,0,0,0.25),inset_2px_0_3px_rgba(255,255,255,0.12)] transition duration-300 hover:-translate-y-2"
            >
              <span className="absolute inset-x-0 top-2.5 mx-auto h-px w-3/5 bg-current opacity-25" />
              <span className="absolute inset-x-0 bottom-2.5 mx-auto h-px w-3/5 bg-current opacity-25" />
              <span
                className={`max-h-[80%] rotate-180 overflow-hidden font-display text-ellipsis whitespace-nowrap [writing-mode:vertical-rl] ${
                  width < 24 ? "text-[0.6rem]" : "text-[0.7rem]"
                }`}
              >
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
