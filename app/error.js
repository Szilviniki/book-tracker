"use client";

// Hibaoldal: ha egy oldal betöltése vagy egy mentés közben hiba történik,
// ez jelenik meg az oldal helyén (a Next "error.js" fájlkonvenciója, ezért kliens komponens).
import { buttonClass } from "@/components/ui";

export default function Error({ error, retry }) {
  return (
    <div className="card mx-auto max-w-md px-8 py-12 text-center">
      <p className="font-display text-xl">
        Hiba <em className="text-accent">történt</em>
      </p>
      <p className="mt-2 text-sm text-muted">{error.message || "Ismeretlen hiba."}</p>
      <button onClick={() => retry()} className={buttonClass("secondary", "mt-6")}>
        Újrapróbálom
      </button>
    </div>
  );
}
