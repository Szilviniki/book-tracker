"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Plus, Search, Dices, ArrowRight } from "lucide-react";
import { useBooks } from "@/lib/useBooks";
import { STATUSES, GENRES } from "@/lib/constants";
import BookCard from "@/components/BookCard";
import BookCover from "@/components/BookCover";
import ProgressBar, { progressPercent } from "@/components/ProgressBar";
import Shelf from "@/components/Shelf";
import { PageHeader, StatTile, Segmented, buttonClass } from "@/components/ui";
import { loadStateView, ErrorBanner } from "@/components/LoadState";

const TABS = { all: "Mind", ...STATUSES };

function greeting(hour) {
  if (hour < 5) return ["Jó", "éjszakát"];
  if (hour < 10) return ["Jó", "reggelt"];
  if (hour < 18) return ["Szép", "napot"];
  return ["Jó", "estét"];
}

export default function Home() {
  const { books, loaded, error } = useBooks();
  const [tab, setTab] = useState("all");
  const [genre, setGenre] = useState("");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [query, setQuery] = useState("");

  const loadState = loadStateView({ loaded, error, hasData: books.length > 0 });
  if (loadState) return loadState;

  const now = new Date();
  const year = now.getFullYear();
  const [hello, helloAccent] = greeting(now.getHours());
  const dateLabel = now.toLocaleDateString("hu-HU", { month: "long", day: "numeric", weekday: "long" });

  if (books.length === 0) {
    return (
      <div className="flex flex-col gap-10">
        <PageHeader eyebrow={dateLabel} title={hello} accent={helloAccent} />
        <div className="card mx-auto max-w-md px-8 py-14 text-center">
          <h2 className="font-display text-2xl">
            Még üres a <em className="text-accent">polcod</em>
          </h2>
          <p className="mt-2 text-sm text-muted">Add hozzá az első könyvet, amit olvasol vagy el szeretnél olvasni.</p>
          <Link href="/add" className={buttonClass("primary", "mt-6")}>
            <Plus size={16} /> Könyv hozzáadása
          </Link>
        </div>
      </div>
    );
  }

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

  const usedGenres = GENRES.filter((g) => books.some((b) => b.genre === g.key));
  const q = query.trim().toLowerCase();
  const visible = books.filter(
    (b) =>
      (tab === "all" || b.status === tab) &&
      (!genre || b.genre === genre) &&
      (!onlyFavorites || b.favorite) &&
      (!q || b.title.toLowerCase().includes(q) || b.authors.some((a) => a.toLowerCase().includes(q)))
  );

  return (
    <div className="flex flex-col gap-10">
      <ErrorBanner error={error} />
      <PageHeader eyebrow={dateLabel} title={hello} accent={helloAccent}>
        <Link href="/add" className={buttonClass()}>
          <Plus size={16} /> Új könyv
        </Link>
      </PageHeader>

      <Shelf books={shelfBooks} />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label={`Elolvasva ${year}-ben`} value={stats.finishedThisYear} tone="accent" />
        <StatTile label="Most olvasom" value={stats.reading} tone="sage" />
        <StatTile label="Olvasásra vár" value={stats.want} tone="teal" />
        <StatTile label="Elolvasott oldal" value={stats.pagesRead.toLocaleString("hu-HU")} tone="sand" />
      </section>

      {stats.want > 0 && (
        <Link
          href="/next"
          className="card group flex items-center gap-4 px-5 py-4 transition hover:border-accent"
        >
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

      {reading.length > 0 && (
        <section>
          <h2 className="eyebrow mb-4">Most olvasom</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {reading.map((book) => (
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
      )}

      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="font-display text-2xl">
            A <em className="text-accent">könyvtáram</em>
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative">
              <Search size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cím vagy szerző…"
                className="field w-52 rounded-full! py-1.5 pl-9 text-sm"
              />
            </label>
            {usedGenres.length > 0 && (
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="field rounded-full! py-1.5 text-sm"
                aria-label="Műfaj"
              >
                <option value="">Minden műfaj</option>
                {usedGenres.map((g) => (
                  <option key={g.key} value={g.key}>
                    {g.label}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              aria-pressed={onlyFavorites}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${
                onlyFavorites ? "border-accent text-accent" : "border-line text-muted hover:text-fg"
              }`}
            >
              <Heart size={14} className={onlyFavorites ? "fill-accent" : ""} /> Kedvencek
            </button>
          </div>
        </div>

        <Segmented
          options={Object.fromEntries(
            Object.entries(TABS).map(([key, label]) => [
              key,
              `${label} · ${key === "all" ? books.length : books.filter((b) => b.status === key).length}`,
            ])
          )}
          value={tab}
          onChange={setTab}
        />

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
    </div>
  );
}
