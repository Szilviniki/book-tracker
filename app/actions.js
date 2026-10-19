"use server";

// Server Actionök: minden adatmódosítás itt történik, a szerveren.
// Az űrlapok közvetlenül ezeket hívják (<form action={...}>), így JavaScript
// nélkül is működnek. Mentés után refresh()-sel frissítjük az aktuális oldalt.

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { createBook, updateBook, deleteBook, ValidationError } from "@/lib/server/books";

// FormData -> könyvmezők. Csak azokat a mezőket vesszük át, amik az űrlapon szerepeltek.
function readFields(formData) {
  const data = {};
  const text = (name) => (formData.has(name) ? String(formData.get(name)).trim() : undefined);

  for (const name of ["title", "status", "format", "genre", "coverUrl", "startedAt", "finishedAt", "notes"]) {
    const value = text(name);
    if (value !== undefined) data[name] = value;
  }
  for (const name of ["totalPages", "currentPage", "rating"]) {
    const value = text(name);
    if (value !== undefined) data[name] = value === "" ? null : Number(value);
  }
  if (formData.has("authors")) {
    data.authors = text("authors")
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
  }
  if (formData.has("source")) data.source = JSON.parse(formData.get("source"));
  return data;
}

// Új könyv a kézi űrlapról. useActionState-tel használjuk, ezért az első
// paraméter az előző állapot, hiba esetén pedig üzenetet adunk vissza.
export async function createBookAction(_prevState, formData) {
  let book;
  try {
    book = createBook(readFields(formData));
  } catch (e) {
    // A beküldött értékeket is visszaadjuk, hogy az űrlap ne ürüljön ki
    if (e instanceof ValidationError) return { error: e.message, values: Object.fromEntries(formData) };
    throw e;
  }
  redirect(`/books/${book.id}`);
}

// Új könyv az Open Library találatokból (rejtett mezőkkel érkezik)
export async function addFoundBook(formData) {
  const book = createBook(readFields(formData));
  redirect(`/books/${book.id}`);
}

// Bármely mező(k) módosítása egy könyvön – a mezőket az űrlap határozza meg
export async function updateBookAction(id, formData) {
  const changes = readFields(formData);

  // Ha az oldalszám eléri a végét, a könyv automatikusan elolvasottá válik
  if (changes.totalPages && changes.currentPage >= changes.totalPages) changes.status = "finished";
  if (changes.totalPages && changes.currentPage > changes.totalPages) changes.currentPage = changes.totalPages;

  updateBook(id, changes);
  refresh();
}

export async function toggleFavorite(id, favorite) {
  updateBook(id, { favorite });
  refresh();
}

export async function startReading(id) {
  updateBook(id, { status: "reading" });
  redirect(`/books/${id}`);
}

export async function deleteBookAction(id) {
  deleteBook(id);
  redirect("/");
}
