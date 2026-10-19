import { Suspense } from "react";
import Link from "next/link";
import Form from "next/form";
import { Heart, Plus, Search } from "lucide-react";
import { listBooks } from "@/lib/server/books";
import { STATUSES, GENRES } from "@/lib/constants";
import { hrefWith, param } from "@/lib/url";
import BookCard from "@/components/BookCard";
import { PageHeader, ChipLink, Spinner, buttonClass } from "@/components/ui";

export const metadata = { title: "Könyvtár" };

export default function LibraryPage({ searchParams }) {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader eyebrow="Könyveim" title="A" accent="könyvtáram">
        <Link href="/add" className={buttonClass()}>
          <Plus size={16} /> Új könyv
        </Link>
      </PageHeader>
      <Suspense fallback={<Spinner />}>
        <Library searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

// A szűrők az URL-ben vannak (?status=…&genre=…&fav=1&q=…),
// így linkekkel és egy sima keresőűrlappal működnek, kliens kód nélkül.
async function Library({ searchParams }) {
  const sp = await searchParams;
  const filters = { status: param(sp.status) ?? "", genre: param(sp.genre) ?? "", fav: param(sp.fav) ?? "", q: param(sp.q) ?? "" };
  const { status, genre, fav, q } = filters;
  const href = (changes) => hrefWith("/library", filters, changes);
  const books = await listBooks();

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
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <Form action="/library" scroll={false} replace className="relative">
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
            className="field w-60 rounded-full! py-1.5 pl-9 text-sm"
          />
        </Form>
        <ChipLink href={href({ fav: fav ? "" : "1" })} active={Boolean(fav)}>
          <span className="flex items-center gap-1.5">
            <Heart size={14} className={fav ? "fill-accent-ink" : ""} /> Kedvencek
          </span>
        </ChipLink>
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
        <p className="py-12 text-center text-muted">
          {books.length === 0 ? "Még üres a könyvtárad." : "Nincs találat ezekkel a szűrőkkel."}
        </p>
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
