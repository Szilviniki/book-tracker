"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useBooks } from "@/lib/useBooks";
import { GENRES } from "@/lib/constants";
import BookCard from "@/components/BookCard";
import { PageHeader, Segmented, buttonClass } from "@/components/ui";
import { loadStateView } from "@/components/LoadState";

const OTHER = "other";

export default function FavoritesPage() {
  const { books, loaded, error } = useBooks();
  const [genre, setGenre] = useState("");

  const loadState = loadStateView({ loaded, error, hasData: books.length > 0 });
  if (loadState) return loadState;

  const favorites = books.filter((b) => b.favorite);

  // Műfajonként csoportosítva, a legnépesebb csoport elöl; műfaj nélküliek a végén
  const groups = [
    ...GENRES.map((g) => ({ key: g.key, label: g.label, books: favorites.filter((b) => b.genre === g.key) })),
    { key: OTHER, label: "Műfaj nélkül", books: favorites.filter((b) => !b.genre) },
  ]
    .filter((g) => g.books.length > 0)
    .sort((a, b) => (a.key === OTHER) - (b.key === OTHER) || b.books.length - a.books.length);

  const visibleGroups = genre ? groups.filter((g) => g.key === genre) : groups;

  return (
    <div className="flex flex-col gap-10">
      <PageHeader eyebrow={`${favorites.length} könyv`} title="Kedvenc" accent="könyveim" />

      {favorites.length === 0 ? (
        <div className="card mx-auto max-w-md px-8 py-12 text-center">
          <Heart size={32} className="mx-auto text-accent" strokeWidth={1.5} />
          <p className="mt-4 font-display text-xl">Még nincs kedvenced</p>
          <p className="mt-2 text-sm text-muted">
            Egy könyv oldalán a „Kedvencnek jelöl” gombbal kerülhet ide.
          </p>
          <Link href="/" className={buttonClass("secondary", "mt-6")}>
            Könyveim
          </Link>
        </div>
      ) : (
        <>
          {groups.length > 1 && (
            <Segmented
              size="sm"
              options={{ "": "Mind", ...Object.fromEntries(groups.map((g) => [g.key, `${g.label} · ${g.books.length}`])) }}
              value={genre}
              onChange={setGenre}
            />
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
      )}
    </div>
  );
}
