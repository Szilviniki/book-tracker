"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dices, BookOpen, RotateCcw } from "lucide-react";
import { useBooks } from "@/lib/useBooks";
import { updateBook } from "@/lib/storage";
import { GENRES, GENRE_LABELS, FORMATS } from "@/lib/constants";
import { candidatePool, pickRandom } from "@/lib/pickBook";
import BookCover from "@/components/BookCover";
import { PageHeader, Segmented, Button, buttonClass } from "@/components/ui";
import { loadStateView } from "@/components/LoadState";

// A "pörgetés" lépései ezredmásodpercben: egyre lassul, mint egy szerencsekerék
const SPIN_STEPS = [60, 60, 70, 70, 80, 90, 100, 120, 140, 170, 210, 260];

export default function NextReadPage() {
  const router = useRouter();
  const { books, loaded, error } = useBooks();
  const [genre, setGenre] = useState("");
  const [reread, setReread] = useState(false);
  const [shown, setShown] = useState(null); // épp látható könyv (pörgetés közben is)
  const [spinning, setSpinning] = useState(false);
  const [starting, setStarting] = useState(false);
  const timers = useRef([]);

  // Ha elhagyjuk az oldalt pörgetés közben, leállítjuk az időzítőket
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const loadState = loadStateView({ loaded, error, hasData: books.length > 0 });
  if (loadState) return loadState;

  const pool = candidatePool(books, { genre, reread });
  // Csak azokat a műfajokat kínáljuk fel, amikből tényleg lehet húzni
  const genreOptions = GENRES.filter((g) => candidatePool(books, { genre: g.key, reread }).length > 0);
  const result = !spinning && shown && pool.some((b) => b.id === shown.id) ? shown : null;

  function spin() {
    if (spinning || pool.length === 0) return;
    const winner = pickRandom(pool, shown?.id);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || pool.length === 1) {
      setShown(winner);
      return;
    }

    setSpinning(true);
    timers.current.forEach(clearTimeout);
    timers.current = [];
    let elapsed = 0;
    SPIN_STEPS.forEach((delay, i) => {
      elapsed += delay;
      const last = i === SPIN_STEPS.length - 1;
      timers.current.push(
        setTimeout(() => {
          setShown(last ? winner : pool[Math.floor(Math.random() * pool.length)]);
          if (last) setSpinning(false);
        }, elapsed)
      );
    });
  }

  async function start() {
    setStarting(true);
    await updateBook(result.id, { status: "reading" });
    router.push(`/books/${result.id}`);
  }

  function changeFilter(update) {
    update();
    setShown(null);
  }

  const wantCount = books.filter((b) => b.status === "want").length;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10">
      <PageHeader eyebrow="Véletlen választó" title="Mi legyen a" accent="következő?" />

      <section className="card flex flex-col gap-5 p-5">
        <div className="flex flex-col gap-2">
          <p className="eyebrow">Műfaj</p>
          <Segmented
            size="sm"
            options={{ "": "Bármi", ...Object.fromEntries(genreOptions.map((g) => [g.key, g.label])) }}
            value={genre}
            onChange={(g) => changeFilter(() => setGenre(g))}
          />
        </div>
        <label className="flex w-fit cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={reread}
            onChange={(e) =>
              changeFilter(() => {
                setReread(e.target.checked);
                setGenre("");
              })
            }
            className="size-4 accent-[var(--accent)]"
          />
          <span>
            Újraolvasás is <span className="text-muted">– az elolvasott könyvek is bekerülnek</span>
          </span>
        </label>
        <p className="text-xs text-faint">
          {pool.length} könyv közül húzunk{genre && ` (${GENRE_LABELS[genre]})`}.
        </p>
      </section>

      {pool.length === 0 ? (
        <div className="card px-8 py-12 text-center">
          <p className="font-display text-xl">
            Nincs miből <em className="text-accent">választani</em>
          </p>
          <p className="mt-2 text-sm text-muted">
            {wantCount === 0
              ? "Tegyél könyveket az „Olvasni szeretném” listára, és itt sorsolhatsz közülük."
              : "Ebben a műfajban nincs olvasásra váró könyv. Próbálj másikat."}
          </p>
          <Link href="/add" className={buttonClass("secondary", "mt-6")}>
            Könyv hozzáadása
          </Link>
        </div>
      ) : (
        <section className="flex flex-col items-center gap-8">
          <div className="relative flex h-80 w-full items-center justify-center">
            {shown ? (
              <div className={`w-48 ${spinning ? "scale-95 opacity-90" : "scale-100"} transition duration-200`}>
                <BookCover book={shown} />
              </div>
            ) : (
              <button
                onClick={spin}
                className="flex aspect-[2/3] w-48 flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-line-strong text-muted transition hover:border-accent hover:text-accent"
              >
                <Dices size={40} strokeWidth={1.5} />
                <span className="text-sm">Húzz egy könyvet</span>
              </button>
            )}
          </div>

          {result && (
            <div className="flex flex-col items-center gap-2 text-center">
              <h2 className="font-display text-3xl">{result.title}</h2>
              {result.authors.length > 0 && <p className="text-muted">{result.authors.join(", ")}</p>}
              <p className="text-xs text-faint">
                {[
                  result.genre && GENRE_LABELS[result.genre],
                  result.totalPages && `${result.totalPages} oldal`,
                  FORMATS[result.format],
                  result.status === "finished" && "újraolvasás",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            {result ? (
              <>
                <Button onClick={start} disabled={starting}>
                  <BookOpen size={16} /> Elkezdem
                </Button>
                <Button variant="secondary" onClick={spin}>
                  <RotateCcw size={16} /> Másikat kérek
                </Button>
              </>
            ) : (
              <Button onClick={spin} disabled={spinning}>
                <Dices size={16} /> {spinning ? "Pörög…" : "Húzz egy könyvet"}
              </Button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
