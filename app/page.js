import { Suspense } from "react";
import Link from "next/link";
import Form from "next/form";
import { Heart, Plus, Search, Dices, ArrowRight } from "lucide-react";
import { listBooks } from "@/lib/server/books";
import { STATUSES, GENRES } from "@/lib/constants";
import { hrefWith, param } from "@/lib/url";
import BookCard from "@/components/BookCard";
import BookCover from "@/components/BookCover";
import ProgressBar, { progressPercent } from "@/components/ProgressBar";
import Shelf from "@/components/Shelf";
import Greeting from "@/components/Greeting";
import { StatTile, ChipLink, Spinner, buttonClass } from "@/components/ui";

export default function Home({ searchParams }) {
  return (
    <div className="flex flex-col gap-10">
      <Greeting>
        <Link href="/add" className={buttonClass()}>
          <Plus size={16} /> Új könyv
        </Link>
      </Greeting>
      <Suspense fallback={<Spinner />}>
        <HomeContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function HomeContent({ searchParams }) {
  const sp = await searchParams;
  const books = await listBooks();

  if (books.length === 0) {
    return (
      <div className="card mx-auto max-w-md px-8 py-14 text-center">
        <h2 className="font-display text-2xl">
          Még üres a <em className="text-accent">polcod</em>
        </h2>
        <p className="mt-2 text-sm text-muted">Add hozzá az első könyvet, amit olvasol vagy el szeretnél olvasni.</p>
        <Link href="/add" className={buttonClass("primary", "mt-6")}>
          <Plus size={16} /> Könyv hozzáadása
        </Link>
      </div>
    );
  }

  const year = new Date().getFullYear();
  const reading = books.filter((b) => b.status === "reading");
  const shelfBooks = [
    ...reading,
    ...books.filter((b) => b.favorite && b.status !== "reading"),
    ...books.filter((b) => b.status === "finished" && !b.favorite),
    ...books.filter((b) => b.status === "want" && !b.favorite),
  ].slice(0, 30);

  const stats = {
    finishedThisYear: books.filter((b) => b.status === "finished" && b.finishedAt?.startsWith(String(year))).length,
    reading: reading.length,
    want: books.filter((b) => b.status === "want").length,
    pagesRead: books.reduce((sum, b) => sum + (b.currentPage || 0), 0),
  };

  return (
    <>
      <Shelf books={shelfBooks} />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label={`Elolvasva ${year}-ben`} value={stats.finishedThisYear} tone="accent" />
        <StatTile label="Most olvasom" value={stats.reading} tone="sage" />
        <StatTile label="Olvasásra vár" value={stats.want} tone="teal" />
        <StatTile label="Elolvasott oldal" value={stats.pagesRead.toLocaleString("hu-HU")} tone="sand" />
      </section>

      {stats.want > 0 && (
        <Link href="/next" className="card group flex items-center gap-4 px-5 py-4 transition hover:border-accent">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-accent">
            <Dices size={22} />
          </span>
          <span className="flex-1">
            <span className="block font-display text-lg">
              Mi legyen a <em className="text-accent">következő?</em>
            </span>
            <span className="text-xs text-muted">
              Sorsolj egyet a {stats.want} olvasásra váró könyved közül – akár műfaj szerint.
            </span>
          </span>
          <ArrowRight size={18} className="text-muted transition group-hover:translate-x-1 group-hover:text-accent" />
        </Link>
      )}

      {reading.length > 0 && <ReadingNow books={reading} />}

      <Library books={books} filters={{ status: param(sp.status), genre: param(sp.genre), fav: param(sp.fav), q: param(sp.q) }} />
    </>
  );
}

function ReadingNow({ books }) {
  return (
    <section>
      <h2 className="eyebrow mb-4">Most olvasom</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <Link
            key={book.id}
            href={`/books/${book.id}`}
            className="card group flex gap-4 p-4 transition hover:border-line-strong"
          >
            <div className="w-16 shrink-0">
              <BookCover book={book} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="line-clamp-2 font-display leading-snug group-hover:text-accent">{book.title}</p>
              <p className="line-clamp-1 text-xs text-muted">{book.authors.join(", ")}</p>
              <div className="mt-auto flex items-center gap-2 pt-3">
                <ProgressBar book={book} />
                <span className="text-xs text-muted tabular-nums lining-nums">{progressPercent(book)}%</span>
              </div>
              {book.totalPages && (
                <p className="mt-1 text-[0.7rem] text-faint tabular-nums lining-nums">
                  {book.currentPage} / {book.totalPages} oldal
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// A könyvtár szűrői az URL-ben vannak (?status=…&genre=…&fav=1&q=…),
// így linkekkel és egy sima keresőűrlappal működnek, kliens kód nélkül.
function Library({ books, filters }) {
  const { status = "", genre = "", fav = "", q = "" } = filters;
  const href = (changes) => hrefWith("/", filters, changes);

  const usedGenres = GENRES.filter((g) => books.some((b) => b.genre === g.key));
  const query = q.trim().toLowerCase();
  const visible = books.filter(
    (b) =>
      (!status || b.status === status) &&
      (!genre || b.genre === genre) &&
      (!fav || b.favorite) &&
      (!query || b.title.toLowerCase().includes(query) || b.authors.some((a) => a.toLowerCase().includes(query)))
  );
  const count = (key) => books.filter((b) => b.status === key).length;

  return (
    <section id="konyvtar" className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="font-display text-2xl">
          A <em className="text-accent">könyvtáram</em>
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <Form action="/" scroll={false} replace className="relative">
            {status && <input type="hidden" name="status" value={status} />}
            {genre && <input type="hidden" name="genre" value={genre} />}
            {fav && <input type="hidden" name="fav" value={fav} />}
            <Search size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Cím vagy szerző…"
              aria-label="Keresés a könyvtárban"
              className="field w-52 rounded-full! py-1.5 pl-9 text-sm"
            />
          </Form>
          <ChipLink href={href({ fav: fav ? "" : "1" })} active={Boolean(fav)}>
            <span className="flex items-center gap-1.5">
              <Heart size={14} className={fav ? "fill-accent-ink" : ""} /> Kedvencek
            </span>
          </ChipLink>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <ChipLink href={href({ status: "" })} active={!status}>
          Mind · {books.length}
        </ChipLink>
        {Object.entries(STATUSES).map(([key, label]) => (
          <ChipLink key={key} href={href({ status: key })} active={status === key}>
            {label} · {count(key)}
          </ChipLink>
        ))}
      </div>

      {usedGenres.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <ChipLink size="sm" href={href({ genre: "" })} active={!genre}>
            Minden műfaj
          </ChipLink>
          {usedGenres.map((g) => (
            <ChipLink key={g.key} size="sm" href={href({ genre: g.key })} active={genre === g.key}>
              {g.label}
            </ChipLink>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="py-12 text-center text-muted">Nincs találat ezekkel a szűrőkkel.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          {visible.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </section>
  );
}
