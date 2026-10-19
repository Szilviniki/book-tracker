"use client";

// Kézi könyvfelvétel. Kliens komponens a useActionState miatt: így a szerver
// hibaüzenete (pl. üres cím) az űrlap mellett jelenik meg, és a beírt adatok
// (amiket a Server Action visszaküld) újra kitöltődnek.
import { useActionState } from "react";
import { createBookAction } from "@/app/actions";
import { GENRES } from "@/lib/constants";
import SeriesField from "./SeriesField";
import SubmitButton from "./SubmitButton";

export default function ManualAddForm({ format, seriesNames = [] }) {
  const [state, formAction] = useActionState(createBookAction, null);
  const values = state?.values ?? {};

  return (
    <form action={formAction} className="mt-5 grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="format" value={format} />
      <Field label="Cím *" name="title" required defaultValue={values.title} className="sm:col-span-2" />
      <Field label="Szerző(k), vesszővel elválasztva" name="authors" defaultValue={values.authors} />
      <Field label="Oldalszám" name="totalPages" type="number" min="1" defaultValue={values.totalPages} />
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-muted">Műfaj</span>
        <select name="genre" defaultValue={values.genre ?? ""} className="field">
          <option value="">Nincs megadva</option>
          {GENRES.map((g) => (
            <option key={g.key} value={g.key}>
              {g.label}
            </option>
          ))}
        </select>
      </label>
      <Field label="Borítókép URL (opcionális)" name="coverUrl" type="url" defaultValue={values.coverUrl} />
      <div className="flex flex-col gap-1.5 text-sm">
        <span className="text-muted">Sorozat (opcionális)</span>
        <SeriesField seriesNames={seriesNames} current={values.seriesChoice} selectClassName="field" />
      </div>
      <Field label="Hányadik kötet" name="seriesIndex" type="number" min="0" step="0.5" defaultValue={values.seriesIndex} />
      <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
        <span className="text-muted">Leírás (opcionális)</span>
        <textarea name="description" rows={4} defaultValue={values.description} className="field text-base leading-relaxed" />
      </label>
      {state?.error && <p className="text-sm text-danger sm:col-span-2">{state.error}</p>}
      <SubmitButton className="sm:col-span-2 sm:justify-self-start">Hozzáadás a könyvtárhoz</SubmitButton>
    </form>
  );
}

function Field({ label, className = "", ...props }) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm ${className}`}>
      <span className="text-muted">{label}</span>
      <input {...props} className="field text-base" />
    </label>
  );
}
