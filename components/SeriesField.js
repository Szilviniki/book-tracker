// Sorozatválasztó: legördülő lista a meglévő sorozatokkal, és egy "+ Új sorozat…"
// elem. Ha azt választod, megjelenik egy mező az új névnek – ezt tisztán CSS
// intézi (:has), JavaScript nélkül. A Server Action a két mezőből állítja össze a nevet.
import { NEW_SERIES } from "@/lib/constants";

export default function SeriesField({ seriesNames, current = "", selectClassName = "field w-full" }) {
  return (
    <div className="group flex flex-col gap-2">
      <select name="seriesChoice" defaultValue={current ?? ""} className={selectClassName} aria-label="Sorozat">
        <option value="">Nincs sorozat</option>
        {seriesNames.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
        <option value={NEW_SERIES} className="new-series">
          + Új sorozat…
        </option>
      </select>
      <input
        name="newSeriesName"
        placeholder="Az új sorozat neve"
        aria-label="Új sorozat neve"
        className="field hidden w-full group-has-[option.new-series:checked]:block"
      />
    </div>
  );
}
