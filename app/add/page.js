"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { searchBooks } from "@/lib/openLibrary";
import { addBook, STATUSES } from "@/lib/storage";
import BookCover from "@/components/BookCover";

export default function AddBookPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("want");
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
      const book = await addBook({ ...data, status });
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
    });
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Új könyv</h1>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">Hova kerüljön?</span>
          {Object.entries(STATUSES).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setStatus(key)}
              className={`rounded-full border px-3 py-1 transition ${
                status === key ? "border-accent bg-accent text-white" : "border-border hover:bg-accent-soft"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <input
          autoFocus
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Keress cím, szerző vagy ISBN alapján…"
          className="w-full rounded-xl border border-border bg-card px-5 py-3 outline-none focus:border-accent"
        />
        {loading && <p className="text-sm text-muted">Keresés…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {shown.length > 0 && (
          <ul className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
            {shown.map((r) => (
              <li key={r.source.key} className="flex items-center gap-4 p-3">
                <div className="w-12 shrink-0">
                  <BookCover book={r} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-serif font-medium">{r.title}</p>
                  <p className="truncate text-sm text-muted">
                    {[r.authors.join(", "), r.year, r.totalPages && `${r.totalPages} oldal`].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <button
                  onClick={() => add(r)}
                  disabled={saving}
                  className="shrink-0 rounded-full bg-accent px-4 py-1.5 text-sm text-white hover:opacity-90 disabled:opacity-50"
                >
                  Hozzáad
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-serif text-xl font-semibold">Vagy add meg kézzel</h2>
        <form onSubmit={addManual} className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Cím *" name="title" required className="sm:col-span-2" />
          <Field label="Szerző(k), vesszővel elválasztva" name="authors" />
          <Field label="Oldalszám" name="totalPages" type="number" min="1" />
          <Field label="Borítókép URL (opcionális)" name="coverUrl" type="url" className="sm:col-span-2" />
          <button
            disabled={saving}
            className="rounded-full bg-foreground px-6 py-2.5 text-background hover:opacity-90 disabled:opacity-50 sm:col-span-2 sm:justify-self-start"
          >
            Mentés
          </button>
        </form>
      </section>
    </div>
  );
}

function Field({ label, className = "", ...props }) {
  return (
    <label className={`flex flex-col gap-1 text-sm ${className}`}>
      <span className="text-muted">{label}</span>
      <input
        {...props}
        className="rounded-lg border border-border bg-card px-3 py-2 text-base outline-none focus:border-accent"
      />
    </label>
  );
}
