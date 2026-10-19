"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useBooks } from "@/lib/useBooks";
import { updateBook, deleteBook, STATUSES } from "@/lib/storage";
import { loadStateView, ErrorBanner } from "@/components/LoadState";
import BookCover from "@/components/BookCover";
import ProgressBar, { progressPercent } from "@/components/ProgressBar";
import StarRating from "@/components/StarRating";

export default function BookDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { books, loaded, error } = useBooks();
  const book = books.find((b) => b.id === id);

  const loadState = loadStateView({ loaded, error, hasData: books.length > 0 });
  if (loadState) return loadState;
  if (!book) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted">Ez a könyv nincs a polcodon.</p>
        <Link href="/" className="mt-4 inline-block text-accent underline">
          Vissza a könyveimhez
        </Link>
      </div>
    );
  }

  const set = (changes) => updateBook(book.id, changes);

  async function remove() {
    if (!confirm(`Biztosan törlöd: „${book.title}”?`)) return;
    try {
      await deleteBook(book.id);
      router.push("/");
    } catch (e) {
      alert(`Nem sikerült törölni: ${e.message}`);
    }
  }

  return (
    <div className="flex flex-col gap-8 md:flex-row">
      <aside className="mx-auto w-48 shrink-0 md:mx-0">
        <BookCover book={book} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-8">
        <ErrorBanner error={error} />
        <header>
          <h1 className="font-serif text-3xl font-semibold leading-tight">{book.title}</h1>
          {book.authors.length > 0 && <p className="mt-1 text-lg text-muted">{book.authors.join(", ")}</p>}
        </header>

        <Section title="Státusz">
          <div className="flex flex-wrap gap-2">
            {Object.entries(STATUSES).map(([key, label]) => (
              <button
                key={key}
                onClick={() => set({ status: key })}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  book.status === key ? "border-accent bg-accent text-white" : "border-border hover:bg-accent-soft"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Section>

        {book.status !== "want" && (
          <Section title="Haladás">
            <ProgressEditor key={book.updatedAt} book={book} onSave={set} />
          </Section>
        )}

        <Section title="Dátumok">
          <div className="flex flex-wrap gap-4 text-sm">
            <DateField label="Elkezdtem" value={book.startedAt} onChange={(v) => set({ startedAt: v })} />
            <DateField label="Befejeztem" value={book.finishedAt} onChange={(v) => set({ finishedAt: v })} />
          </div>
        </Section>

        {book.status === "finished" && (
          <Section title="Értékelés">
            <StarRating value={book.rating} onChange={(rating) => set({ rating })} />
          </Section>
        )}

        <Section title="Jegyzetek">
          <textarea
            defaultValue={book.notes}
            onBlur={(e) => e.target.value !== book.notes && set({ notes: e.target.value })}
            rows={5}
            placeholder="Gondolatok, kedvenc idézetek…"
            className="w-full rounded-lg border border-border bg-card p-3 outline-none focus:border-accent"
          />
          <p className="mt-1 text-xs text-muted">Automatikusan mentődik, amikor kikattintasz.</p>
        </Section>

        <div className="flex gap-4 border-t border-border pt-6 text-sm">
          <Link href="/" className="text-muted hover:text-foreground">
            ← Vissza
          </Link>
          <button onClick={remove} className="ml-auto text-red-600 hover:underline">
            Könyv törlése
          </button>
        </div>
      </div>
    </div>
  );
}

function ProgressEditor({ book, onSave }) {
  const [page, setPage] = useState(book.currentPage);
  const [total, setTotal] = useState(book.totalPages ?? "");

  function save(e) {
    e.preventDefault();
    const totalPages = Number(total) || null;
    const currentPage = Math.max(0, Math.min(Number(page) || 0, totalPages ?? Infinity));
    const changes = { currentPage, totalPages };
    if (totalPages && currentPage >= totalPages && book.status !== "finished") changes.status = "finished";
    onSave(changes);
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <ProgressBar book={book} />
        <span className="w-12 text-right text-sm text-muted">{progressPercent(book)}%</span>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <input
          type="number"
          min="0"
          value={page}
          onChange={(e) => setPage(e.target.value)}
          className="w-24 rounded-lg border border-border bg-card px-3 py-1.5 outline-none focus:border-accent"
          aria-label="Jelenlegi oldal"
        />
        <span className="text-muted">/</span>
        <input
          type="number"
          min="1"
          value={total}
          onChange={(e) => setTotal(e.target.value)}
          placeholder="összes"
          className="w-24 rounded-lg border border-border bg-card px-3 py-1.5 outline-none focus:border-accent"
          aria-label="Összes oldal"
        />
        <span className="text-muted">oldal</span>
        <button className="ml-2 rounded-full bg-accent px-4 py-1.5 text-white hover:opacity-90">Mentés</button>
      </div>
    </form>
  );
}

function DateField({ label, value, onChange }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-muted">{label}</span>
      <input
        type="date"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="rounded-lg border border-border bg-card px-3 py-1.5 outline-none focus:border-accent"
      />
    </label>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">{title}</h2>
      {children}
    </section>
  );
}
