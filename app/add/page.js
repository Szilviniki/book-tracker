"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus } from "lucide-react";
import { searchBooks } from "@/lib/openLibrary";
import { addBook } from "@/lib/storage";
import { STATUSES, FORMATS, GENRES, GENRE_LABELS } from "@/lib/constants";
import BookCover from "@/components/BookCover";
import { PageHeader, Segmented, Section, Button } from "@/components/ui";

export default function AddBookPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("want");
  const [format, setFormat] = useState("physical");
  const [saving, setSaving] = useState(false);

  // Keresés gépelés közben, kis késleltetéssel (debounce)
  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        setResults(await searchBooks(q, { signal: controller.signal }));
      } catch (e) {
        if (e.name !== "AbortError") setError("Nem sikerült a keresés. Próbáld újra, vagy add hozzá kézzel.");
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // 3 karakter alatt nem mutatunk találatot
  const shown = query.trim().length >= 3 ? results : [];

  async function add(data) {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const book = await addBook({ ...data, status, format });
      router.push(`/books/${book.id}`);
    } catch (e) {
      setError(`Nem sikerült menteni: ${e.message}`);
      setSaving(false);
    }
  }

  function addManual(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    add({
      title: form.get("title").trim(),
      authors: form
        .get("authors")
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      totalPages: Number(form.get("totalPages")) || null,
      coverUrl: form.get("coverUrl").trim() || null,
      genre: form.get("genre") || null,
    });
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10">
      <PageHeader eyebrow="Könyveim" title="Új" accent="könyv" />

      <div className="grid gap-6 sm:grid-cols-2">
        <Section title="Hova kerüljön?">
          <Segmented size="sm" options={STATUSES} value={status} onChange={setStatus} />
        </Section>
        <Section title="Formátum">
          <Segmented size="sm" options={FORMATS} value={format} onChange={setFormat} />
        </Section>
      </div>

      <section className="flex flex-col gap-4">
        <label className="relative">
          <Search size={18} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-faint" />
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Keress cím, szerző vagy ISBN alapján…"
            className="field w-full rounded-xl! py-3.5 pl-11 text-base"
          />
        </label>
        {loading && <p className="text-sm text-muted">Keresés…</p>}
        {error && <p className="text-sm text-danger">{error}</p>}
        {shown.length > 0 && (
          <ul className="card flex flex-col divide-y divide-line overflow-hidden">
            {shown.map((r) => (
              <li key={r.source.key} className="flex items-center gap-4 p-3 transition hover:bg-surface-2">
                <div className="w-12 shrink-0">
                  <BookCover book={r} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display">{r.title}</p>
                  <p className="truncate text-sm text-muted">
                    {[r.authors.join(", "), r.year, r.totalPages && `${r.totalPages} oldal`].filter(Boolean).join(" · ")}
                  </p>
                  {r.genre && (
                    <span className="mt-1 inline-block rounded-full bg-surface-2 px-2 py-0.5 text-[0.7rem] text-sage">
                      {GENRE_LABELS[r.genre]}
                    </span>
                  )}
                </div>
                <Button onClick={() => add(r)} disabled={saving} className="shrink-0 px-4! py-1.5!">
                  <Plus size={15} /> Hozzáad
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card p-6">
        <h2 className="font-display text-xl">
          Vagy add meg <em className="text-accent">kézzel</em>
        </h2>
        <form onSubmit={addManual} className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Cím *" name="title" required className="sm:col-span-2" />
          <Field label="Szerző(k), vesszővel elválasztva" name="authors" />
          <Field label="Oldalszám" name="totalPages" type="number" min="1" />
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted">Műfaj</span>
            <select name="genre" defaultValue="" className="field">
              <option value="">Nincs megadva</option>
              {GENRES.map((g) => (
                <option key={g.key} value={g.key}>
                  {g.label}
                </option>
              ))}
            </select>
          </label>
          <Field label="Borítókép URL (opcionális)" name="coverUrl" type="url" />
          <Button disabled={saving} className="sm:col-span-2 sm:justify-self-start">
            Mentés
          </Button>
        </form>
      </section>
    </div>
  );
}

function Field({ label, className = "", ...props }) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm ${className}`}>
      <span className="text-muted">{label}</span>
      <input {...props} className="field text-base" />
    </label>
  );
}
