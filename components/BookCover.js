/* eslint-disable @next/next/no-img-element */
// Sima <img>-et használunk, mert a borítók bármilyen külső címről jöhetnek.
import { spineColor, spineTextColor } from "@/lib/bookColor";

export default function BookCover({ book, className = "" }) {
  if (book.coverUrl) {
    return (
      <img
        src={book.coverUrl}
        alt={`${book.title} borítója`}
        loading="lazy"
        className={`aspect-[2/3] w-full rounded-md object-cover shadow-lg shadow-black/40 ${className}`}
      />
    );
  }
  // Borító nélkül: a könyv saját színével, a címmel
  return (
    <div
      style={{ backgroundColor: spineColor(book), color: spineTextColor(book) }}
      className={`flex aspect-[2/3] w-full flex-col justify-between rounded-md p-3 shadow-lg shadow-black/40 ${className}`}
    >
      <span className="line-clamp-4 font-display text-sm leading-tight">{book.title}</span>
      {book.authors?.[0] && <span className="line-clamp-2 text-[0.65rem] opacity-75">{book.authors[0]}</span>}
    </div>
  );
}
