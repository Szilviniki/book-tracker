"use client";

export default function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Értékelés">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} csillag`}
          onClick={() => onChange(value === n ? null : n)}
          className={`text-2xl transition hover:scale-110 ${
            value && n <= value ? "text-accent" : "text-border"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
