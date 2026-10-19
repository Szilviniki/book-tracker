import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Heart } from "lucide-react";
import { getBook } from "@/lib/server/books";
import { updateBookAction, toggleFavorite } from "@/app/actions";
import { STATUSES, FORMATS, GENRES } from "@/lib/constants";
import BookCover from "@/components/BookCover";
import ProgressBar, { progressPercent } from "@/components/ProgressBar";
import StarRating from "@/components/StarRating";
import SubmitButton from "@/components/SubmitButton";
import DeleteBookButton from "@/components/DeleteBookButton";
import { ChipButton, Section, Spinner } from "@/components/ui";

export async function generateMetadata({ params }) {
  const book = await getBook((await params).id);
  return { title: book?.title ?? "Nincs ilyen könyv" };
}

export default function BookPage({ params }) {
  return (
    <div className="flex flex-col gap-8">
      <Link href="/" className="flex w-fit items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft size={16} /> Könyveim
      </Link>
      <Suspense fallback={<Spinner />}>
        <BookDetail params={params} />
      </Suspense>
    </div>
  );
}

async function BookDetail({ params }) {
  const { id } = await params;
  const book = await getBook(id);
  if (!book) notFound();

  // Minden űrlap ugyanazt a Server Actiont hívja, a könyv azonosítójával "előre kitöltve"
  const update = updateBookAction.bind(null, book.id);

  return (
    <div className="flex flex-col gap-10 md:flex-row">
      <aside className="mx-auto flex w-52 shrink-0 flex-col gap-4 md:mx-0">
        <BookCover book={book} />
        <form action={toggleFavorite.bind(null, book.id, !book.favorite)}>
          <button
            aria-pressed={book.favorite}
            className={`flex w-full items-center justify-center gap-2 rounded-full border py-2 text-sm transition ${
              book.favorite ? "border-accent text-accent" : "border-line text-muted hover:text-fg"
            }`}
          >
            <Heart size={16} className={book.favorite ? "fill-accent" : ""} />
            {book.favorite ? "Kedvenc" : "Kedvencnek jelöl"}
          </button>
        </form>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-8">
        <header>
          <h1 className="font-display text-3xl leading-tight sm:text-4xl">{book.title}</h1>
          {book.authors.length > 0 && <p className="mt-2 text-lg text-muted">{book.authors.join(", ")}</p>}
        </header>

        <Section title="Státusz">
          <form action={update} className="flex flex-wrap gap-1.5">
            {Object.entries(STATUSES).map(([key, label]) => (
              <ChipButton key={key} name="status" value={key} active={book.status === key}>
                {label}
              </ChipButton>
            ))}
          </form>
        </Section>

        {book.status !== "want" && (
          <Section title="Haladás" className="card p-5">
            <form action={update} className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <ProgressBar book={book} className="h-2!" />
                <span className="w-12 text-right font-display text-xl text-accent tabular-nums lining-nums">
                  {progressPercent(book)}%
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <input
                  key={book.currentPage}
                  type="number"
                  name="currentPage"
                  min="0"
                  defaultValue={book.currentPage}
                  className="field w-24"
                  aria-label="Jelenlegi oldal"
                />
                <span className="text-muted">/</span>
                <input
                  key={book.totalPages}
                  type="number"
                  name="totalPages"
                  min="1"
                  defaultValue={book.totalPages ?? ""}
                  placeholder="összes"
                  className="field w-24"
                  aria-label="Összes oldal"
                />
                <span className="text-muted">oldal</span>
                <SubmitButton className="ml-auto">Mentés</SubmitButton>
              </div>
            </form>
          </Section>
        )}

        {book.status === "finished" && (
          <Section title="Értékelés">
            <StarRating value={book.rating} action={update} />
          </Section>
        )}

        {/* A többi adat egy űrlapban, egy Mentés gombbal. A key miatt mentés után
            az űrlap az adatbázisban lévő friss értékekkel töltődik újra. */}
        <form key={book.updatedAt} action={update} className="flex flex-col gap-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Műfaj">
              <select name="genre" defaultValue={book.genre ?? ""} className="field w-full">
                <option value="">Nincs megadva</option>
                {GENRES.map((g) => (
                  <option key={g.key} value={g.key}>
                    {g.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Formátum">
              <select name="format" defaultValue={book.format} className="field w-full">
                {Object.entries(FORMATS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Elkezdtem">
              <input type="date" name="startedAt" defaultValue={book.startedAt ?? ""} className="field w-full" />
            </Field>
            <Field label="Befejeztem">
              <input type="date" name="finishedAt" defaultValue={book.finishedAt ?? ""} className="field w-full" />
            </Field>
          </div>
          <Field label="Jegyzetek">
            <textarea
              name="notes"
              defaultValue={book.notes}
              rows={5}
              placeholder="Gondolatok, kedvenc idézetek…"
              className="field w-full leading-relaxed"
            />
          </Field>
          <SubmitButton className="self-start">Adatok mentése</SubmitButton>
        </form>

        <div className="flex justify-end border-t border-line pt-6">
          <DeleteBookButton id={book.id} title={book.title} />
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="eyebrow">{label}</span>
      {children}
    </label>
  );
}
