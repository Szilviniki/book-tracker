import { Suspense } from "react";
import Link from "next/link";
import { listBooks } from "@/lib/server/books";
import { GENRES, GENRE_LABELS } from "@/lib/constants";
import { candidatePool } from "@/lib/pickBook";
import { hrefWith, param } from "@/lib/url";
import Randomizer from "@/components/Randomizer";
import { PageHeader, ChipLink, Spinner, buttonClass } from "@/components/ui";

export const metadata = { title: "Mi legyen a következő?" };

export default function NextReadPage({ searchParams }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10">
      <PageHeader eyebrow="Véletlen választó" title="Mi legyen a" accent="következő?" />
      <Suspense fallback={<Spinner />}>
        <NextRead searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

// A szűrők (műfaj, újraolvasás) az URL-ben vannak; a szerver állítja össze, mely
// könyvek közül lehet húzni. Csak maga a sorsolás és animáció fut a böngészőben.
async function NextRead({ searchParams }) {
  const sp = await searchParams;
  const reread = param(sp.reread) === "1";
  const genre = param(sp.genre) ?? "";
  const books = await listBooks();

  const pool = candidatePool(books, { genre, reread });
  const genreOptions = GENRES.filter((g) => candidatePool(books, { genre: g.key, reread }).length > 0);
  const current = { genre, reread: reread ? "1" : "" };
  const href = (changes) => hrefWith("/next", current, changes);
  const wantCount = books.filter((b) => b.status === "want").length;

  return (
    <>
      <section className="card flex flex-col gap-5 p-5">
        <div className="flex flex-col gap-2">
          <p className="eyebrow">Műfaj</p>
          <div className="flex flex-wrap gap-1.5">
            <ChipLink size="sm" href={href({ genre: "" })} active={!genre}>
              Bármi
            </ChipLink>
            {genreOptions.map((g) => (
              <ChipLink key={g.key} size="sm" href={href({ genre: g.key })} active={genre === g.key}>
                {g.label}
              </ChipLink>
            ))}
          </div>
        </div>
        <Link
          href={href({ reread: reread ? "" : "1", genre: "" })}
          scroll={false}
          replace
          role="switch"
          aria-checked={reread}
          className="flex w-fit items-center gap-3 text-sm"
        >
          <span
            className={`flex h-5 w-9 items-center rounded-full p-0.5 transition ${reread ? "bg-accent" : "bg-line-strong"}`}
          >
            <span className={`size-4 rounded-full bg-fg transition ${reread ? "translate-x-4" : ""}`} />
          </span>
          <span>
            Újraolvasás is <span className="text-muted">– az elolvasott könyvek is bekerülnek</span>
          </span>
        </Link>
        <p className="text-xs text-faint">
          {pool.length} könyv közül húzunk{genre && GENRE_LABELS[genre] && ` (${GENRE_LABELS[genre]})`}.
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
        // A key miatt szűrőváltáskor a választó "tiszta lappal" indul
        <Randomizer key={`${genre}|${reread}`} pool={pool.map(toCandidate)} />
      )}
    </>
  );
}

// A böngészőnek csak azt küldjük el, ami a választóhoz kell (pl. jegyzeteket nem)
function toCandidate({ id, title, authors, coverUrl, genre, totalPages, format, status }) {
  return { id, title, authors, coverUrl, genre, totalPages, format, status };
}
