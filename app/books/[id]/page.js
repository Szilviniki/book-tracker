import { Suspense } from "react";
import BookDetail from "@/components/BookDetail";

export default function BookPage() {
  return (
    <Suspense>
      <BookDetail />
    </Suspense>
  );
}
