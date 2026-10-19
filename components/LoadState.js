// Betöltés alatt / betöltési hiba esetén megjelenő üzenet.
// Ha minden rendben van, null-t ad vissza, és az oldal a saját tartalmát mutatja.
export function loadStateView({ loaded, error, hasData }) {
  if (!loaded) return <p className="py-20 text-center text-muted">Betöltés…</p>;
  if (error && !hasData) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="font-medium text-red-600">Nem sikerült betölteni az adatokat.</p>
        <p className="mt-1 text-sm text-muted">{error}</p>
      </div>
    );
  }
  return null;
}

export function ErrorBanner({ error }) {
  if (!error) return null;
  return (
    <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
      Hiba a mentésnél: {error}
    </p>
  );
}
