"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Heart, Trash2 } from "lucide-react";
import { useBooks } from "@/lib/useBooks";
import { updateBook, deleteBook } from "@/lib/storage";
import { STATUSES, FORMATS, GENRES } from "@/lib/constants";
import { loadStateView, ErrorBanner } from "@/components/LoadState";
import BookCover from "@/components/BookCover";
import ProgressBar, { progressPercent } from "@/components/ProgressBar";
import StarRating from "@/components/StarRating";
import { Segmented, Section, Button } from "@/components/ui";

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
    <div className="flex flex-col gap-8">
      <Link href="/" className="flex w-fit items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft size={16} /> Könyveim
      </Link>
      <ErrorBanner error={error} />

      <div className="flex flex-col gap-10 md:flex-row">
        <aside className="mx-auto flex w-52 shrink-0 flex-col gap-4 md:mx-0">
          <BookCover book={book} />
          <button
            onClick={() => set({ favorite: !book.favorite })}
            aria-pressed={book.favorite}
            className={`flex items-center justify-center gap-2 rounded-full border py-2 text-sm transition ${
              book.favorite ? "border-accent text-accent" : "border-line text-muted hover:text-fg"
            }`}
          >
            <Heart size={16} className={book.favorite ? "fill-accent" : ""} />
            {book.favorite ? "Kedvenc" : "Kedvencnek jelöl"}
          </button>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-8">
          <header>
            <h1 className="font-display text-3xl leading-tight sm:text-4xl">{book.title}</h1>
            {book.authors.length > 0 && <p className="mt-2 text-lg text-muted">{book.authors.join(", ")}</p>}
          </header>

          <Section title="Státusz">
            <Segmented options={STATUSES} value={book.status} onChange={(status) => set({ status })} />
          </Section>

          {book.status !== "want" && (
            <Section title="Haladás" className="card p-5">
              <ProgressEditor key={book.updatedAt} book={book} onSave={set} />
            </Section>
          )}

          {book.status === "finished" && (
            <Section title="Értékelés">
              <StarRating value={book.rating} onChange={(rating) => set({ rating })} />
            </Section>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <Section title="Műfaj">
              <select
                value={book.genre ?? ""}
                onChange={(e) => set({ genre: e.target.value || null })}
                className="field w-full"
              >
                <option value="">Nincs megadva</option>
                {GENRES.map((g) => (
                  <option key={g.key} value={g.key}>
                    {g.label}
                  </option>
                ))}
              </select>
            </Section>
            <Section title="Formátum">
              <Segmented size="sm" options={FORMATS} value={book.format} onChange={(format) => set({ format })} />
            </Section>
            <Section title="Elkezdtem">
              <DateField value={book.startedAt} onChange={(v) => set({ startedAt: v })} />
            </Section>
            <Section title="Befejeztem">
              <DateField value={book.finishedAt} onChange={(v) => set({ finishedAt: v })} />
            </Section>
          </div>

          <Section title="Jegyzetek">
            <textarea
              defaultValue={book.notes}
              onBlur={(e) => e.target.value !== book.notes && set({ notes: e.target.value })}
              rows={5}
              placeholder="Gondolatok, kedvenc idézetek…"
              className="field w-full leading-relaxed"
            />
            <p className="mt-1 text-xs text-faint">Automatikusan mentődik, amikor kikattintasz.</p>
          </Section>

          <div className="flex border-t border-line pt-6">
            <button onClick={remove} className="ml-auto flex items-center gap-1.5 text-sm text-danger hover:underline">
              <Trash2 size={15} /> Könyv törlése
            </button>
          </div>
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
    <form onSubmit={save} className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <ProgressBar book={book} className="h-2!" />
        <span className="w-12 text-right font-display text-xl text-accent tabular-nums lining-nums">{progressPercent(book)}%</span>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <input
          type="number"
          min="0"
          value={page}
          onChange={(e) => setPage(e.target.value)}
          className="field w-24"
          aria-label="Jelenlegi oldal"
        />
        <span className="text-muted">/</span>
        <input
          type="number"
          min="1"
          value={total}
          onChange={(e) => setTotal(e.target.value)}
          placeholder="összes"
          className="field w-24"
          aria-label="Összes oldal"
        />
        <span className="text-muted">oldal</span>
        <Button className="ml-auto">Mentés</Button>
      </div>
    </form>
  );
}

function DateField({ value, onChange }) {
  return (
    <input
      type="date"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      className="field w-full"
    />
  );
}
