import { Suspense } from "react";
import Link from "next/link";
import { Plus, Dices, ArrowRight } from "lucide-react";
import { listBooks } from "@/lib/server/books";
import { fillSpineColorsLater } from "@/lib/server/spineColors";
import { GENRES, FORMATS } from "@/lib/constants";
import { hrefWith, param } from "@/lib/url";
import { totals, highlights, monthlySummary, yearsWithData, genreBreakdown, statusBreakdown } from "@/lib/stats";
import Shelf from "@/components/Shelf";
import Greeting from "@/components/Greeting";
import { MonthlyBars, GenreDonut, StatusBar } from "@/components/dashboard/charts";
import { Panel, CoverRow, ReadingProgress, StatRow, Highlight } from "@/components/dashboard/panels";
import { ChipLink, Spinner, buttonClass } from "@/components/ui";

export default function DashboardPage({ searchParams }) {
  return (
    <div className="flex flex-col gap-8">
      <Greeting>
        <Link href="/add" className={buttonClass()}>
          <Plus size={16} /> Új könyv
        </Link>
      </Greeting>
      <Suspense fallback={<Spinner />}>
        <Dashboard searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

// A dashboard szűrői is az URL-ben vannak:
//   year – a havi összesítő éve, fg – kedvencek műfaja, ng / nf – következő olvasmány műfaja / formátuma
async function Dashboard({ searchParams }) {
  const sp = await searchParams;
  const books = await listBooks();
  fillSpineColorsLater(); // hiányzó gerincszínek pótlása a háttérben

  if (books.length === 0) {
    return (
      <div className="card mx-auto max-w-md px-8 py-14 text-center">
        <h2 className="font-display text-2xl">
          Még üres a <em className="text-accent">polcod</em>
        </h2>
        <p className="mt-2 text-sm text-muted">Add hozzá az első könyvet, amit olvasol vagy el szeretnél olvasni.</p>
        <Link href="/add" className={buttonClass("primary", "mt-6")}>
          <Plus size={16} /> Könyv hozzáadása
        </Link>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const years = yearsWithData(books, currentYear);
  const year = years.includes(Number(param(sp.year))) ? Number(param(sp.year)) : currentYear;
  const filters = { year: year === currentYear ? "" : year, fg: param(sp.fg) ?? "", ng: param(sp.ng) ?? "", nf: param(sp.nf) ?? "" };
  const href = (changes) => hrefWith("/", filters, changes);

  const t = totals(books);
  const h = highlights(books);
  const reading = books.filter((b) => b.status === "reading");
  const shelfBooks = [
    ...reading,
    ...books.filter((b) => b.favorite && b.status !== "reading"),
    ...books.filter((b) => b.status === "finished" && !b.favorite),
    ...books.filter((b) => b.status === "want" && !b.favorite),
  ].slice(0, 30);

  const favorites = books.filter((b) => b.favorite);
  const favoriteGenres = GENRES.filter((g) => favorites.some((b) => b.genre === g.key));
  const shownFavorites = favorites.filter((b) => !filters.fg || b.genre === filters.fg).slice(0, 5);

  const want = books.filter((b) => b.status === "want");
  const wantGenres = GENRES.filter((g) => want.some((b) => b.genre === g.key));
  const wantFormats = Object.entries(FORMATS).filter(([key]) => want.some((b) => b.format === key));
  const nextUp = want.filter((b) => (!filters.ng || b.genre === filters.ng) && (!filters.nf || b.format === filters.nf));

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1fr)_13rem_20rem]">
      {/* Bal oszlop: polc, most olvasom, kedvencek, következő olvasmány */}
      <div className="flex min-w-0 flex-col gap-6">
        <Shelf books={shelfBooks} />

        <Panel title="Most olvasom">
          <CoverRow books={reading} caption={(book) => <ReadingProgress book={book} />} empty="Épp nem olvasol semmit." />
        </Panel>

        <Panel title="Kedvenc könyveim" action={<Link href="/favorites" className="text-xs text-muted hover:text-accent">Mind →</Link>}>
          {favoriteGenres.length > 1 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              <ChipLink size="sm" href={href({ fg: "" })} active={!filters.fg}>Mind</ChipLink>
              {favoriteGenres.map((g) => (
                <ChipLink key={g.key} size="sm" href={href({ fg: g.key })} active={filters.fg === g.key}>
                  {g.label}
                </ChipLink>
              ))}
            </div>
          )}
          <CoverRow books={shownFavorites} empty="Még nincs kedvenced – egy könyv oldalán jelölheted meg." />
        </Panel>

        <Panel
          title="Következő olvasmány"
          action={
            nextUp.length > 0 && (
              <Link href={hrefWith("/next", {}, { genre: filters.ng })} className="flex items-center gap-1.5 text-xs text-muted hover:text-accent">
                <Dices size={14} /> Sorsolj ezek közül <ArrowRight size={12} />
              </Link>
            )
          }
        >
          {(wantGenres.length > 0 || wantFormats.length > 1) && (
            <div className="mb-4 flex flex-col gap-2">
              {wantGenres.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  <ChipLink size="sm" href={href({ ng: "" })} active={!filters.ng}>Minden műfaj</ChipLink>
                  {wantGenres.map((g) => (
                    <ChipLink key={g.key} size="sm" href={href({ ng: g.key })} active={filters.ng === g.key}>
                      {g.label}
                    </ChipLink>
                  ))}
                </div>
              )}
              {wantFormats.length > 1 && (
                <div className="flex flex-wrap gap-1.5">
                  <ChipLink size="sm" href={href({ nf: "" })} active={!filters.nf}>Bármilyen formátum</ChipLink>
                  {wantFormats.map(([key, label]) => (
                    <ChipLink key={key} size="sm" href={href({ nf: key })} active={filters.nf === key}>
                      {label}
                    </ChipLink>
                  ))}
                </div>
              )}
            </div>
          )}
          <CoverRow books={nextUp.slice(0, 5)} empty="Nincs ilyen olvasásra váró könyved." />
        </Panel>
      </div>

      {/* Középső oszlop: számok és kiemelések */}
      <div className="grid content-start gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <StatRow label="Összes könyv" value={t.all} color="var(--spine-1)" />
        <StatRow label="Elolvasva" value={t.finished} color="var(--spine-3)" />
        <StatRow label="Olvasásra vár" value={t.want} color="var(--spine-2)" />
        <StatRow label="Most olvasom" value={t.reading} color="var(--spine-4)" />
        <StatRow label="Elolvasott oldal" value={t.pagesRead.toLocaleString("hu-HU")} color="var(--spine-7)" />
        <div className="grid grid-cols-1 gap-3 sm:col-span-2 sm:grid-cols-3 xl:col-span-1 xl:grid-cols-1">
          <Highlight label="Top műfaj" value={h.genre?.label} detail={h.genre && `${h.genre.count} könyv`} />
          <Highlight label="Top szerző" value={h.author?.label} detail={h.author && `${h.author.count} könyv`} />
          <Highlight
            label="Leghosszabb könyv"
            value={h.longest?.label}
            detail={h.longest && `${h.longest.count} oldal`}
            href={h.longest && `/books/${h.longest.id}`}
          />
        </div>
      </div>

      {/* Jobb oszlop: grafikonok */}
      <div className="grid content-start gap-6 md:grid-cols-2 xl:grid-cols-1">
        <Panel
          title={`Éves összesítő · ${year}`}
          className="md:row-span-2 xl:row-span-1"
          action={
            years.length > 1 && (
              <div className="flex gap-1">
                {years.slice(0, 4).map((y) => (
                  <ChipLink key={y} size="sm" href={href({ year: y === currentYear ? "" : y })} active={y === year}>
                    {y}
                  </ChipLink>
                ))}
              </div>
            )
          }
        >
          <MonthlyBars months={monthlySummary(books, year)} year={year} />
        </Panel>
        <Panel title="Műfajok szerint">
          <GenreDonut slices={genreBreakdown(books)} />
        </Panel>
        <Panel title="Státusz szerint">
          <StatusBar parts={statusBreakdown(books)} />
        </Panel>
      </div>
    </div>
  );
}
