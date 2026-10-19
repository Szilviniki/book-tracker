# 📚 Könyvespolc

Könyvkövető alkalmazás: mit olvasok, hol tartok benne, mit gondolok róla.
Később reading journal és digitális könyvtár is lesz belőle.

**Technológia:** Next.js 16 (App Router), JavaScript, Tailwind CSS, SQLite (Node beépített `node:sqlite`), lucide-react ikonok.

**Design:** sötét, meleg alap poros pasztell színekkel. A színek tokenként az `app/globals.css` elején vannak, a közös elemek a `components/ui.js`-ben.

## Indítás

```bash
npm install
npm run dev
```

Utána: http://localhost:3000

Az adatok a `data/konyvespolc.db` fájlban vannak (első indításkor jön létre, gitbe nem kerül).

## Felépítés

Az app a Next.js App Router ajánlott működését követi:

- **Server Components** – az oldalak a szerveren készülnek, közvetlenül az adatbázisból olvasnak.
- **Server Actions** – minden mentés sima `<form>`-ból, szerveroldali függvénnyel történik (JavaScript nélkül is működik).
- **Szűrők az URL-ben** – pl. `/?status=reading&genre=fantasy`, így linkelhetők és visszaléptethetők.
- **Kliens komponens csak ahol kell** – aktív menüpont, mentés-jelző gomb, törlés-megerősítés, helyi idő szerinti köszöntés, a véletlen választó animációja, a kézi felvétel hibaüzenete.

| Hely | Tartalom |
| --- | --- |
| `app/` | Oldalak (`page.js`; az új könyv felvétele: `app/library/add`), `actions.js` (Server Actions), `error.js`, `not-found.js` |
| `components/` | Felületi elemek; a `"use client"` jelölésűek futnak a böngészőben |
| `lib/server/` | Adatbázis és lekérdezések (csak szerveren) – sémaváltozás: `MIGRATIONS` a `db.js`-ben |
| `lib/openLibrary.js` | Könyvkeresés az Open Library API-val (szerveren, 1 órás gyorsítótárral) |
| `lib/constants.js` | Státuszok, formátumok, műfajok |

## Tervek

- [x] Teljes design átalakítás
- [x] Kedvencek oldal és „Mi legyen a következő?” véletlen választó
- [ ] Naptárnézet és olvasási napló
- [ ] Dashboard átalakítás
- [ ] AI-os könyvértékelő oldal
- [ ] Docker
