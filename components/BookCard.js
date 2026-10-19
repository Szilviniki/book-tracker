import Link from "next/link";
import BookCover from "./BookCover";
import ProgressBar from "./ProgressBar";

export default function BookCard({ book }) {
  return (
    <Link href={`/books/${book.id}`} className="group flex flex-col gap-2">
      <BookCover book={book} className="transition group-hover:-translate-y-1 group-hover:shadow-md" />
      <div>
        <h3 className="line-clamp-2 font-serif font-medium leading-snug">{book.title}</h3>
        {book.authors.length > 0 && (
          <p className="line-clamp-1 text-sm text-muted">{book.authors.join(", ")}</p>
        )}
      </div>
      {book.status === "reading" && <ProgressBar book={book} />}
      {book.status === "finished" && book.rating && (
        <p className="text-sm text-accent">{"★".repeat(book.rating)}</p>
      )}
    </Link>
  );
}
