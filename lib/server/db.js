import "server-only";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";

// SQLite adatbázis egyetlen fájlban: data/konyvespolc.db
// A Node beépített node:sqlite modulját használjuk, nincs szükség külső csomagra.

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "konyvespolc.db");

// Sémaváltozások sorban. Új táblát / oszlopot mindig új elemként adj hozzá a
// lista végére, a régieket ne módosítsd – így a meglévő adatbázisok is frissülnek.
const MIGRATIONS = [
  `CREATE TABLE books (
    id           TEXT PRIMARY KEY,
    title        TEXT NOT NULL,
    authors      TEXT NOT NULL DEFAULT '[]',  -- JSON tömb
    cover_url    TEXT,
    total_pages  INTEGER,
    current_page INTEGER NOT NULL DEFAULT 0,
    status       TEXT NOT NULL DEFAULT 'want' CHECK (status IN ('want', 'reading', 'finished')),
    rating       INTEGER CHECK (rating BETWEEN 1 AND 5),
    started_at   TEXT,
    finished_at  TEXT,
    notes        TEXT NOT NULL DEFAULT '',
    source       TEXT,                        -- JSON, pl. {"type":"openlibrary","key":"/works/..."}
    created_at   TEXT NOT NULL,
    updated_at   TEXT NOT NULL
  )`,
  // 2: műfaj, formátum, kedvenc
  `ALTER TABLE books ADD COLUMN genre TEXT;
   ALTER TABLE books ADD COLUMN format TEXT NOT NULL DEFAULT 'physical'
     CHECK (format IN ('physical', 'ebook', 'audio'));
   ALTER TABLE books ADD COLUMN favorite INTEGER NOT NULL DEFAULT 0;`,
  // 3: a borítóból számolt gerincszín ('#rrggbb', vagy 'none', ha nem sikerült)
  `ALTER TABLE books ADD COLUMN spine_color TEXT;`,
];

function migrate(db) {
  const version = db.prepare("PRAGMA user_version").get().user_version;
  for (let i = version; i < MIGRATIONS.length; i++) {
    db.exec("BEGIN");
    try {
      db.exec(MIGRATIONS[i]);
      db.exec(`PRAGMA user_version = ${i + 1}`);
      db.exec("COMMIT");
    } catch (e) {
      db.exec("ROLLBACK");
      throw e;
    }
  }
}

function open() {
  mkdirSync(DATA_DIR, { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  return db;
}

// Fejlesztés közben a Next újratölti a modulokat, ezért a kapcsolatot
// globálisan tároljuk, hogy ne nyissunk újat minden mentéskor.
export const db = (globalThis.__konyvespolcDb ??= open());

// Minden betöltéskor lefut; ha nincs új migráció, nem csinál semmit.
migrate(db);
