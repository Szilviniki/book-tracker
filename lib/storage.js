// Kliensoldali adatréteg. Az adatok a szerveren, SQLite adatbázisban vannak
// (lásd lib/server/), ez a modul az /api/books végpontokon keresztül éri el őket,
// és memóriában tartja a listát, hogy a komponensek azonnal frissüljenek.

export const STATUSES = {
  want: "Olvasni szeretném",
  reading: "Olvasom",
  finished: "Elolvastam",
};

const SERVER_STATE = { books: [], loaded: false, error: null };
let state = SERVER_STATE;
let loading = null;
const listeners = new Set();

function setState(changes) {
  state = { ...state, ...changes };
  listeners.forEach((fn) => fn());
}

async function api(path, options = {}) {
  const res = await fetch(`/api/books${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Szerverhiba (${res.status})`);
  }
  return res.status === 204 ? null : res.json();
}

async function load() {
  try {
    await importLegacyLocalStorage();
    setState({ books: await api(""), loaded: true, error: null });
  } catch (e) {
    setState({ loaded: true, error: e.message });
  } finally {
    loading = null;
  }
}

export function subscribe(fn) {
  listeners.add(fn);
  if (!state.loaded && !loading) loading = load();
  return () => listeners.delete(fn);
}

export function getState() {
  return state;
}

export function getServerState() {
  return SERVER_STATE;
}

export async function addBook(data) {
  const book = await api("", { method: "POST", body: JSON.stringify(data) });
  setState({ books: [book, ...state.books] });
  return book;
}

export async function updateBook(id, changes) {
  const previous = state.books;
  // Optimista frissítés: rögtön mutatjuk a változást, a szerver válasza pontosítja
  setState({ books: previous.map((b) => (b.id === id ? { ...b, ...changes } : b)) });
  try {
    const book = await api(`/${id}`, { method: "PATCH", body: JSON.stringify(changes) });
    setState({ books: state.books.map((b) => (b.id === id ? book : b)), error: null });
  } catch (e) {
    setState({ books: previous, error: e.message });
  }
}

export async function deleteBook(id) {
  await api(`/${id}`, { method: "DELETE" });
  setState({ books: state.books.filter((b) => b.id !== id) });
}

// Egyszeri átköltöztetés: a korábbi verzió a böngésző localStorage-ába mentett.
// Ha ott maradt könyv, feltöltjük az adatbázisba, majd töröljük a régi kulcsot.
const LEGACY_KEY = "book-tracker:books";

async function importLegacyLocalStorage() {
  let legacy;
  try {
    legacy = JSON.parse(window.localStorage.getItem(LEGACY_KEY));
  } catch {
    return;
  }
  if (!Array.isArray(legacy) || legacy.length === 0) return;
  // A localStorage-ban a legújabb volt elöl; fordítva töltjük fel, hogy a sorrend megmaradjon
  for (const book of [...legacy].reverse()) {
    await api("", { method: "POST", body: JSON.stringify(book) });
  }
  window.localStorage.removeItem(LEGACY_KEY);
}
