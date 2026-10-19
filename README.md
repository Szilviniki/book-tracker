# 📚 Könyvespolc

Könyvkövető alkalmazás: mit olvasok, hol tartok benne, mit gondolok róla.
Később reading journal és digitális könyvtár is lesz belőle.

**Technológia:** Next.js 16 (App Router), JavaScript, Tailwind CSS, SQLite (Node beépített `node:sqlite`).

## Indítás

```bash
npm install
npm run dev
```

Utána: http://localhost:3000

Az adatok a `data/konyvespolc.db` fájlban vannak (első indításkor jön létre, gitbe nem kerül).

## Felépítés

| Mappa | Tartalom |
| --- | --- |
| `app/` | Oldalak és API végpontok (`app/api/books`) |
| `components/` | Újrahasználható felületi elemek |
| `lib/storage.js`, `lib/useBooks.js` | Kliensoldali adatréteg (az API-t hívja) |
| `lib/server/` | Adatbázis és szerveroldali logika – sémaváltozás: `MIGRATIONS` a `db.js`-ben |
| `lib/openLibrary.js` | Könyvkeresés az Open Library API-val |

## Tervek

- [ ] Teljes design átalakítás
- [ ] Naptárnézet és olvasási napló
- [ ] Dashboard átalakítás
- [ ] AI-os könyvértékelő oldal
- [ ] Docker
