import Link from "next/link";
import { buttonClass } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="card mx-auto max-w-md px-8 py-12 text-center">
      <p className="font-display text-xl">
        Ez nincs a <em className="text-accent">polcon</em>
      </p>
      <p className="mt-2 text-sm text-muted">A keresett oldal vagy könyv nem létezik (vagy törölted).</p>
      <Link href="/" className={buttonClass("secondary", "mt-6")}>
        Vissza a könyveimhez
      </Link>
    </div>
  );
}
