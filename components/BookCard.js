import Link from "next/link";
import { Heart } from "lucide-react";
import BookCover from "./BookCover";
import ProgressBar, { progressPercent } from "./ProgressBar";
import { Stars } from "./StarRating";

export default function BookCard({ book }) {
  return (
    <Link href={`/books/${book.id}`} className="group flex flex-col gap-3">
      <div className="relative">
        <BookCover book={book} className="transition duration-300 group-hover:-translate-y-1.5" />
        {book.favorite && (
          <span className="absolute top-2 right-2 rounded-full bg-bg/80 p-1.5 backdrop-blur">
            <Heart size={12} className="fill-accent text-accent" />
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="line-clamp-2 font-display leading-snug group-hover:text-accent">{book.title}</h3>
        {book.authors.length > 0 && <p className="line-clamp-1 text-xs text-muted">{book.authors.join(", ")}</p>}
      </div>
      {book.status === "reading" && (
        <div className="flex items-center gap-2">
          <ProgressBar book={book} />
          <span className="text-xs text-muted tabular-nums lining-nums">{progressPercent(book)}%</span>
        </div>
      )}
      {book.status === "finished" && <Stars value={book.rating} />}
    </Link>
  );
}
