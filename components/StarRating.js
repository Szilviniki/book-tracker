"use client";

import { Star } from "lucide-react";

export default function StarRating({ value, onChange, size = 24 }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Értékelés">
      {[1, 2, 3, 4, 5].map((n) => {
        const on = value && n <= value;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} csillag`}
            onClick={() => onChange(value === n ? null : n)}
            className="transition hover:scale-110"
          >
            <Star size={size} className={on ? "fill-sand text-sand" : "text-line-strong"} />
          </button>
        );
      })}
    </div>
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
