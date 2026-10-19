export function progressPercent(book) {
  if (book.status === "finished") return 100;
  if (!book.totalPages) return 0;
  return Math.min(100, Math.round((book.currentPage / book.totalPages) * 100));
}

export default function ProgressBar({ book, className = "" }) {
  const pct = progressPercent(book);
  return (
    <div
      className={`h-1.5 w-full overflow-hidden rounded-full bg-line ${className}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}
