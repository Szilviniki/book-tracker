"use client";

import { useState } from "react";
import Link from "next/link";
import { useBooks } from "@/lib/useBooks";
import { STATUSES } from "@/lib/storage";
import BookCard from "@/components/BookCard";
import { loadStateView, ErrorBanner } from "@/components/LoadState";

const TABS = [{ key: "all", label: "Mind" }, ...Object.entries(STATUSES).map(([key, label]) => ({ key, label }))];

export default function Home() {
  const { books, loaded, error } = useBooks();
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");

  const loadState = loadStateView({ loaded, error, hasData: books.length > 0 });
  if (loadState) return loadState;

  const year = new Date().getFullYear();
  const stats = {
    reading: books.filter((b) => b.status === "reading").length,
    finishedThisYear: books.filter((b) => b.status === "finished" && b.finishedAt?.startsWith(String(year))).length,
    pagesRead: books.reduce((sum, b) => sum + (b.currentPage || 0), 0),
  };

  const q = query.trim().toLowerCase();
  const visible = books.filter(
    (b) =>
      (tab === "all" || b.status === tab) &&
      (!q || b.title.toLowerCase().includes(q) || b.authors.some((a) => a.toLowerCase().includes(q)))
  );

  if (books.length === 0) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-5xl">📖</p>
        <h1 className="mt-4 font-serif text-2xl font-semibold">Még üres a polcod</h1>
        <p className="mt-2 text-muted">Add hozzá az első könyvet, amit olvasol vagy el szeretnél olvasni.</p>
        <Link href="/add" className="mt-6 inline-block rounded-full bg-accent px-6 py-3 text-white hover:opacity-90">
          Könyv hozzáadása
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <ErrorBanner error={error} />
      <section className="grid grid-cols-3 gap-3">
        <Stat label="Most olvasom" value={stats.reading} />
        <Stat label={`Elolvasva ${year}-ben`} value={stats.finishedThisYear} />
        <Stat label="Elolvasott oldal" value={stats.pagesRead.toLocaleString("hu-HU")} />
      </section>

      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => {
            const count = t.key === "all" ? books.length : books.filter((b) => b.status === t.key).length;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  tab === t.key ? "border-accent bg-accent text-white" : "border-border hover:bg-accent-soft"
                }`}
              >
                {t.label} <span className="opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Keresés a polcon…"
          className="rounded-full border border-border bg-card px-4 py-2 text-sm outline-none focus:border-accent sm:w-64"
        />
      </section>

      {visible.length === 0 ? (
        <p className="py-12 text-center text-muted">Nincs találat.</p>
      ) : (
        <section className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {visible.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="font-serif text-2xl font-semibold sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-muted sm:text-sm">{label}</p>
    </div>
  );
}
