export function progressPercent(book) {
  if (book.status === "finished") return 100;
  if (!book.totalPages) return 0;
  return Math.min(100, Math.round((book.currentPage / book.totalPages) * 100));
}

export default function ProgressBar({ book }) {
  const pct = progressPercent(book);
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-border" aria-label={`${pct}%`}>
      <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}
