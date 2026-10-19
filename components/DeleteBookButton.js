"use client";

// Törlés gomb megerősítéssel – a confirm() ablak miatt kell ide kliens kód.
import { Trash2 } from "lucide-react";
import { deleteBookAction } from "@/app/actions";

export default function DeleteBookButton({ id, title }) {
  return (
    <form
      action={deleteBookAction.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm(`Biztosan törlöd: „${title}”?`)) e.preventDefault();
      }}
    >
      <button className="flex items-center gap-1.5 text-sm text-danger hover:underline">
        <Trash2 size={15} /> Könyv törlése
      </button>
    </form>
  );
}
