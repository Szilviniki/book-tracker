import { Suspense } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { listBooks } from "@/lib/server/books";
import { GENRES } from "@/lib/constants";
import { hrefWith, param } from "@/lib/url";
import BookCard from "@/components/BookCard";
import { PageHeader, ChipLink, Spinner, buttonClass } from "@/components/ui";

export const metadata = { title: "Kedvencek" };

const OTHER = "other";

export default function FavoritesPage({ searchParams }) {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader eyebrow="Könyveim" title="Kedvenc" accent="könyveim" />
      <Suspense fallback={<Spinner />}>
        <Favorites searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Favorites({ searchParams }) {
  const genre = param((await searchParams).genre) ?? "";
  const favorites = (await listBooks()).filter((b) => b.favorite);

  if (favorites.length === 0) {
    return (
      <div className="card mx-auto max-w-md px-8 py-12 text-center">
        <Heart size={32} className="mx-auto text-accent" strokeWidth={1.5} />
        <p className="mt-4 font-display text-xl">Még nincs kedvenced</p>
        <p className="mt-2 text-sm text-muted">Egy könyv oldalán a „Kedvencnek jelöl” gombbal kerülhet ide.</p>
        <Link href="/" className={buttonClass("secondary", "mt-6")}>
          Könyveim
        </Link>
      </div>
    );
  }

  // Műfajonként csoportosítva, a legnépesebb csoport elöl; műfaj nélküliek a végén
  const groups = [
    ...GENRES.map((g) => ({ key: g.key, label: g.label, books: favorites.filter((b) => b.genre === g.key) })),
    { key: OTHER, label: "Műfaj nélkül", books: favorites.filter((b) => !b.genre) },
  ]
    .filter((g) => g.books.length > 0)
    .sort((a, b) => (a.key === OTHER) - (b.key === OTHER) || b.books.length - a.books.length);

  const visibleGroups = genre ? groups.filter((g) => g.key === genre) : groups;

  return (
    <>
      {groups.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          <ChipLink size="sm" href="/favorites" active={!genre}>
            Mind · {favorites.length}
          </ChipLink>
          {groups.map((g) => (
            <ChipLink key={g.key} size="sm" href={hrefWith("/favorites", {}, { genre: g.key })} active={genre === g.key}>
              {g.label} · {g.books.length}
            </ChipLink>
          ))}
        </div>
      )}
      {visibleGroups.map((group) => (
        <section key={group.key} className="flex flex-col gap-5">
          <h2 className="flex items-baseline gap-3 font-display text-2xl">
            <em className="text-accent">{group.label}</em>
            <span className="font-sans text-xs text-faint">{group.books.length}</span>
          </h2>
          <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
            {group.books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
