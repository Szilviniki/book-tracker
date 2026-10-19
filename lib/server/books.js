import "server-only";
import { db } from "./db";

// A könyvek adatbázis-műveletei. Csak a szerveren fut (API route-okból hívjuk).

const STATUSES = ["want", "reading", "finished"];

// Adatbázis-sor -> JS objektum (ugyanaz a forma, amit a kliens használ)
function toBook(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    authors: JSON.parse(row.authors),
    coverUrl: row.cover_url,
    totalPages: row.total_pages,
    currentPage: row.current_page,
    status: row.status,
    rating: row.rating,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    notes: row.notes,
    source: row.source ? JSON.parse(row.source) : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// JS mezőnév -> oszlop, és az érték átalakítása/ellenőrzése
const FIELDS = {
  title: ["title", (v) => {
    const t = String(v ?? "").trim();
    if (!t) throw new ValidationError("A cím nem lehet üres.");
    return t;
  }],
  authors: ["authors", (v) => JSON.stringify(Array.isArray(v) ? v.map(String) : [])],
  coverUrl: ["cover_url", (v) => v || null],
  totalPages: ["total_pages", (v) => (v ? Math.max(1, Math.round(Number(v))) || null : null)],
  currentPage: ["current_page", (v) => Math.max(0, Math.round(Number(v)) || 0)],
  status: ["status", (v) => {
    if (!STATUSES.includes(v)) throw new ValidationError(`Ismeretlen státusz: ${v}`);
    return v;
  }],
  rating: ["rating", (v) => (v ? Math.min(5, Math.max(1, Math.round(Number(v)))) : null)],
  startedAt: ["started_at", (v) => v || null],
  finishedAt: ["finished_at", (v) => v || null],
  notes: ["notes", (v) => String(v ?? "")],
  source: ["source", (v) => (v ? JSON.stringify(v) : null)],
};

export class ValidationError extends Error {}

function toColumns(data) {
  const cols = {};
  for (const [key, value] of Object.entries(data)) {
    if (!(key in FIELDS)) continue; // ismeretlen mezőket figyelmen kívül hagyjuk
    const [column, convert] = FIELDS[key];
    cols[column] = convert(value);
  }
  return cols;
}

export function listBooks() {
  return db.prepare("SELECT * FROM books ORDER BY created_at DESC").all().map(toBook);
}

export function getBook(id) {
  return toBook(db.prepare("SELECT * FROM books WHERE id = ?").get(id));
}

export function createBook(data) {
  const now = new Date().toISOString();
  const cols = {
    id: crypto.randomUUID(),
    ...toColumns({ authors: [], status: "want", ...data }),
    created_at: data.createdAt || now,
    updated_at: now,
  };
  if (!cols.title) throw new ValidationError("A cím nem lehet üres.");
  applyStatusRules(cols, cols);

  const names = Object.keys(cols);
  db.prepare(
    `INSERT INTO books (${names.join(", ")}) VALUES (${names.map((n) => `@${n}`).join(", ")})`
  ).run(cols);
  return getBook(cols.id);
}

export function updateBook(id, changes) {
  const current = getBook(id);
  if (!current) return null;

  const cols = toColumns(changes);
  applyStatusRules(cols, {
    started_at: current.startedAt,
    finished_at: current.finishedAt,
    total_pages: current.totalPages,
    ...cols,
  });
  cols.updated_at = new Date().toISOString();

  const sets = Object.keys(cols).map((n) => `${n} = @${n}`);
  db.prepare(`UPDATE books SET ${sets.join(", ")} WHERE id = @id`).run({ ...cols, id });
  return getBook(id);
}

export function deleteBook(id) {
  return db.prepare("DELETE FROM books WHERE id = ?").run(id).changes > 0;
}

// Státuszváltáskor automatikusan kitöltjük a dátumokat és az oldalszámot.
// `cols` a menteni kívánt oszlopok, `merged` ugyanez a már meglévő értékekkel együtt.
function applyStatusRules(cols, merged) {
  const today = new Date().toISOString().slice(0, 10);
  if (cols.status === "reading" && !merged.started_at) cols.started_at = today;
  if (cols.status === "finished") {
    if (!merged.finished_at) cols.finished_at = today;
    if (merged.total_pages) cols.current_page = merged.total_pages;
  }
}
