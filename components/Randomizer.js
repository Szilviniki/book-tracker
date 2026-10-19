"use client";

// A sorsolás és a "pörgető" animáció – ez a rész igényel böngészős JavaScriptet.
// A könyvlistát (pool) a szerver adja, az "Elkezdem" pedig Server Actiont hív.
import { useEffect, useRef, useState } from "react";
import { Dices, BookOpen, RotateCcw } from "lucide-react";
import { startReading } from "@/app/actions";
import { GENRE_LABELS, FORMATS } from "@/lib/constants";
import { pickRandom } from "@/lib/pickBook";
import BookCover from "./BookCover";
import SubmitButton from "./SubmitButton";
import { Button } from "./ui";

// A pörgetés lépései ezredmásodpercben: egyre lassul, mint egy szerencsekerék
const SPIN_STEPS = [60, 60, 70, 70, 80, 90, 100, 120, 140, 170, 210, 260];

export default function Randomizer({ pool }) {
  const [shown, setShown] = useState(null); // épp látható könyv (pörgetés közben is)
  const [spinning, setSpinning] = useState(false);
  const timers = useRef([]);

  // Ha elhagyjuk az oldalt pörgetés közben, leállítjuk az időzítőket
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const result = spinning ? null : shown;

  function spin() {
    if (spinning) return;
    const winner = pickRandom(pool, shown?.id);
    if (pool.length === 1 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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

  return (
    <section className="flex flex-col items-center gap-8">
      <div className="flex h-80 w-full items-center justify-center">
        {shown ? (
          <div className={`w-48 transition duration-200 ${spinning ? "scale-95 opacity-90" : ""}`}>
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
        <div className="flex flex-col items-center gap-2 text-center" aria-live="polite">
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
            <form action={startReading.bind(null, result.id)}>
              <SubmitButton pendingText="Indul…">
                <BookOpen size={16} /> Elkezdem
              </SubmitButton>
            </form>
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
  );
}
