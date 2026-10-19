import { Suspense } from "react";
import Form from "next/form";
import { Search, Plus } from "lucide-react";
import { searchBooks } from "@/lib/openLibrary";
import { listSeriesNames } from "@/lib/server/books";
import { addFoundBook } from "@/app/actions";
import { STATUSES, FORMATS, GENRE_LABELS } from "@/lib/constants";
import { hrefWith, param } from "@/lib/url";
import BookCover from "@/components/BookCover";
import SubmitButton from "@/components/SubmitButton";
import ManualAddForm from "@/components/ManualAddForm";
import { PageHeader, ChipLink, Section, Spinner } from "@/components/ui";

export const metadata = { title: "Új könyv" };

export default function AddBookPage({ searchParams }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10">
      <PageHeader eyebrow="Könyveim" title="Új" accent="könyv" />
      <Suspense fallback={<Spinner />}>
        <AddBook searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

// A keresés, a státusz és a formátum is az URL-ben van (?q=…&status=…&format=…),
// a keresést a szerver végzi – a böngészőnek nem kell hozzá JavaScript.
async function AddBook({ searchParams }) {
  const sp = await searchParams;
  const q = param(sp.q)?.trim() ?? "";
  const status = Object.hasOwn(STATUSES, param(sp.status) ?? "") ? param(sp.status) : "want";
  const format = Object.hasOwn(FORMATS, param(sp.format) ?? "") ? param(sp.format) : "physical";
  const current = { q, status, format };

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2">
        <Section title="Hova kerüljön?">
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(STATUSES).map(([key, label]) => (
              <ChipLink key={key} size="sm" href={hrefWith("/add", current, { status: key })} active={status === key}>
                {label}
              </ChipLink>
            ))}
          </div>
        </Section>
        <Section title="Formátum">
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(FORMATS).map(([key, label]) => (
              <ChipLink key={key} size="sm" href={hrefWith("/add", current, { format: key })} active={format === key}>
                {label}
              </ChipLink>
            ))}
          </div>
        </Section>
      </div>

      <section className="flex flex-col gap-4">
        <Form action="/add" className="flex gap-2">
          <input type="hidden" name="status" value={status} />
          <input type="hidden" name="format" value={format} />
          <label className="relative flex-1">
            <Search size={18} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-faint" />
            <input
              autoFocus
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Keress cím, szerző vagy ISBN alapján…"
              aria-label="Keresés az Open Libraryben"
              className="field w-full rounded-xl! py-3.5 pl-11 text-base"
            />
          </label>
          <SubmitButton pendingText="Keresés…" className="rounded-xl! px-6">
            Keresés
          </SubmitButton>
        </Form>

        {q.length >= 2 && (
          <Suspense key={q} fallback={<p className="text-sm text-muted">Keresés…</p>}>
            <SearchResults q={q} status={status} format={format} />
          </Suspense>
        )}
      </section>

      <section className="card p-6">
        <h2 className="font-display text-xl">
          Vagy add meg <em className="text-accent">kézzel</em>
        </h2>
        <ManualAddForm status={status} format={format} seriesNames={await listSeriesNames()} />
      </section>
    </>
  );
}

async function SearchResults({ q, status, format }) {
  let results;
  try {
    results = await searchBooks(q);
  } catch {
    return <p className="text-sm text-danger">Nem sikerült a keresés. Próbáld újra, vagy add hozzá kézzel.</p>;
  }
  if (results.length === 0) return <p className="text-sm text-muted">Nincs találat erre: „{q}”.</p>;

  return (
    <ul className="card flex flex-col divide-y divide-line overflow-hidden">
      {results.map((r) => (
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
          {/* A találat adatai rejtett mezőkben mennek a Server Actionnek */}
          <form action={addFoundBook}>
            <input type="hidden" name="title" value={r.title} />
            <input type="hidden" name="authors" value={r.authors.join(", ")} />
            <input type="hidden" name="coverUrl" value={r.coverUrl ?? ""} />
            <input type="hidden" name="totalPages" value={r.totalPages ?? ""} />
            <input type="hidden" name="genre" value={r.genre ?? ""} />
            <input type="hidden" name="source" value={JSON.stringify(r.source)} />
            <input type="hidden" name="status" value={status} />
            <input type="hidden" name="format" value={format} />
            <SubmitButton pendingText="…" className="shrink-0 px-4! py-1.5!">
              <Plus size={15} /> Hozzáad
            </SubmitButton>
          </form>
        </li>
      ))}
    </ul>
  );
}
