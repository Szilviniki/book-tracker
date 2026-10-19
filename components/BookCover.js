/* eslint-disable @next/next/no-img-element */
// Sima <img>-et használunk, mert a borítók bármilyen külső címről jöhetnek.

export default function BookCover({ book, className = "" }) {
  if (book.coverUrl) {
    return (
      <img
        src={book.coverUrl}
        alt={`${book.title} borítója`}
        className={`aspect-[2/3] w-full rounded-md object-cover shadow-sm ${className}`}
      />
    );
  }
  return (
    <div
      className={`flex aspect-[2/3] w-full items-center justify-center rounded-md bg-accent-soft p-3 text-center font-serif text-sm text-accent shadow-sm ${className}`}
    >
      {book.title}
    </div>
  );
}
