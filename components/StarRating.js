import { Star } from "lucide-react";

// Értékelő csillagok űrlapként: minden csillag egy küldőgomb (name="rating").
// A már kiválasztott csillagra kattintva töröljük az értékelést.
export default function StarRating({ value, action }) {
  return (
    <form action={action} className="flex gap-1" aria-label="Értékelés">
      {[1, 2, 3, 4, 5].map((n) => {
        const on = value && n <= value;
        return (
          <button
            key={n}
            name="rating"
            value={value === n ? "" : n}
            aria-label={`${n} csillag`}
            aria-pressed={value === n}
            className="transition hover:scale-110"
          >
            <Star size={24} className={on ? "fill-sand text-sand" : "text-line-strong"} />
          </button>
        );
      })}
    </form>
  );
}

export function Stars({ value, size = 12 }) {
  if (!value) return null;
  return (
    <span className="flex gap-0.5" aria-label={`${value} csillag`}>
      {Array.from({ length: value }, (_, i) => (
        <Star key={i} size={size} className="fill-sand text-sand" />
      ))}
    </span>
  );
}
