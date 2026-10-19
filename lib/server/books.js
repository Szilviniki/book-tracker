import "server-only";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "./db";
import { STATUSES, FORMATS, GENRE_LABELS } from "@/lib/constants";

// A könyvek adatbázis-műveletei. Csak a szerveren fut: az olvasásokat a
// Server Componentek, az írásokat a Server Actionök (app/actions.js) hívják.

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
    description: row.description,
    genre: row.genre,
    format: row.format,
    favorite: Boolean(row.favorite),
    spineColor: row.spine_color?.startsWith("#") ? row.spine_color : null,
    seriesName: row.series_name,
    seriesIndex: row.series_index,
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
    if (!Object.hasOwn(STATUSES, v)) throw new ValidationError(`Ismeretlen státusz: ${v}`);
    return v;
  }],
  rating: ["rating", (v) => (v ? Math.min(5, Math.max(1, Math.round(Number(v)))) : null)],
  startedAt: ["started_at", (v) => v || null],
  finishedAt: ["finished_at", (v) => v || null],
  notes: ["notes", (v) => String(v ?? "")],
  description: ["description", (v) => String(v ?? "").trim()],
  genre: ["genre", (v) => {
    if (v && !Object.hasOwn(GENRE_LABELS, v)) throw new ValidationError(`Ismeretlen műfaj: ${v}`);
    return v || null;
  }],
  format: ["format", (v) => {
    if (!Object.hasOwn(FORMATS, v)) throw new ValidationError(`Ismeretlen formátum: ${v}`);
    return v;
  }],
  favorite: ["favorite", (v) => (v ? 1 : 0)],
  seriesName: ["series_name", (v) => String(v ?? "").trim() || null],
  seriesIndex: ["series_index", (v) => (v === null || v === "" || Number.isNaN(Number(v)) ? null : Math.max(0, Number(v)))],
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

// A belépett felhasználó azonosítója; belépés nélkül a /login oldalra visz.
// Minden művelet ezzel szűr, így mindenki csak a saját könyveit látja és módosítja.
// A connection() kell: a node:sqlite szinkron, ezért enélkül a Next a build közben
// lefuttatná és "befagyasztaná" az eredményt az oldalba.
async function currentUserId() {
  await connection();
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
}

export async function listBooks() {
  const userId = await currentUserId();
  return db.prepare("SELECT * FROM books WHERE user_id = ? ORDER BY created_at DESC").all(userId).map(toBook);
}

export async function getBook(id) {
  return findBook(id, await currentUserId());
}

// A már használt sorozatnevek (az űrlap felajánlja őket, hogy ne kelljen pontosan begépelni)
export async function listSeriesNames() {
  const userId = await currentUserId();
  return db
    .prepare(
      "SELECT DISTINCT series_name FROM books WHERE user_id = ? AND series_name IS NOT NULL ORDER BY series_name COLLATE NOCASE"
    )
    .all(userId)
    .map((row) => row.series_name);
}

function findBook(id, userId) {
  return toBook(db.prepare("SELECT * FROM books WHERE id = ? AND user_id = ?").get(id, userId));
}

export async function createBook(data) {
  const userId = await currentUserId();
  const now = new Date().toISOString();
  const cols = {
    id: crypto.randomUUID(),
    ...toColumns({ authors: [], status: "want", ...data }),
    user_id: userId,
    created_at: data.createdAt || now,
    updated_at: now,
  };
  if (!cols.title) throw new ValidationError("A cím nem lehet üres.");
  applyStatusRules(cols, cols);

  const names = Object.keys(cols);
  db.prepare(
    `INSERT INTO books (${names.join(", ")}) VALUES (${names.map((n) => `@${n}`).join(", ")})`
  ).run(cols);
  return findBook(cols.id, userId);
}

export async function updateBook(id, changes) {
  const userId = await currentUserId();
  const current = findBook(id, userId);
  if (!current) return null;

  const cols = toColumns(changes);
  if ("cover_url" in cols && cols.cover_url !== current.coverUrl) cols.spine_color = null;
  applyStatusRules(cols, {
    started_at: current.startedAt,
    finished_at: current.finishedAt,
    total_pages: current.totalPages,
    ...cols,
  });
  cols.updated_at = new Date().toISOString();

  const sets = Object.keys(cols).map((n) => `${n} = @${n}`);
  db.prepare(`UPDATE books SET ${sets.join(", ")} WHERE id = @id`).run({ ...cols, id });
  return findBook(id, userId);
}

// Gerincszín: azok a borítós könyvek, amiknek még nem számoltuk ki a színét
export function booksMissingSpineColor() {
  return db.prepare("SELECT id, cover_url FROM books WHERE cover_url IS NOT NULL AND spine_color IS NULL").all();
}

export function setSpineColor(id, color) {
  db.prepare("UPDATE books SET spine_color = ? WHERE id = ?").run(color ?? "none", id);
}

export async function deleteBook(id) {
  const userId = await currentUserId();
  return db.prepare("DELETE FROM books WHERE id = ? AND user_id = ?").run(id, userId).changes > 0;
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
