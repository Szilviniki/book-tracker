// A dashboard paneljei (szerveroldali komponensek).
import Link from "next/link";
import { Award } from "lucide-react";
import BookCover from "@/components/BookCover";
import ProgressBar, { progressPercent } from "@/components/ProgressBar";

// Keretes panel ritkított nagybetűs címmel – mint a minta dashboard dobozai
export function Panel({ title, action, children, className = "" }) {
  return (
    <section className={`card p-5 ${className}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="eyebrow tracking-[0.22em]">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

// Borítók sorban, alattuk opcionális felirattal
export function CoverRow({ books, caption, empty }) {
  if (books.length === 0) return <p className="py-6 text-center text-sm text-muted">{empty}</p>;
  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
      {books.map((book) => (
        <Link key={book.id} href={`/books/${book.id}`} className="group flex flex-col gap-2">
          <BookCover book={book} className="transition duration-300 group-hover:-translate-y-1" />
          <span className="line-clamp-2 text-center text-xs leading-snug text-muted group-hover:text-fg">{book.title}</span>
          {caption?.(book)}
        </Link>
      ))}
    </div>
  );
}

export function ReadingProgress({ book }) {
  return (
    <span className="flex flex-col items-center gap-1">
      <ProgressBar book={book} />
      <span className="font-display text-lg text-accent tabular-nums lining-nums">{progressPercent(book)}%</span>
    </span>
  );
}

// Színes statisztika-sor (felirat balra, szám jobbra)
export function StatRow({ label, value, color }) {
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-lg px-4 py-3"
      style={{ backgroundColor: `color-mix(in oklab, ${color} 22%, var(--surface))` }}
    >
      <span className="text-[0.7rem] font-semibold tracking-[0.12em] text-muted uppercase">{label}</span>
      <span className="font-display text-2xl tabular-nums lining-nums">{value}</span>
    </div>
  );
}

// "Érmes" kiemelés: top műfaj, top szerző stb.
export function Highlight({ label, value, detail, href }) {
  const body = (
    <>
      <Award size={22} className="mx-auto text-sand" strokeWidth={1.6} />
      <p className="mt-2 text-[0.65rem] font-semibold tracking-[0.14em] text-muted uppercase">{label}</p>
      <p className="mt-1 line-clamp-2 font-display leading-snug">{value ?? "–"}</p>
      {detail && <p className="mt-0.5 text-xs text-faint tabular-nums lining-nums">{detail}</p>}
    </>
  );
  const className = "card block px-3 py-4 text-center transition";
  return href ? (
    <Link href={href} className={`${className} hover:border-line-strong`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
