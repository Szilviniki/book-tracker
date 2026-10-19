// Betöltés alatt / betöltési hiba esetén megjelenő üzenet.
// Ha minden rendben van, null-t ad vissza, és az oldal a saját tartalmát mutatja.
export function loadStateView({ loaded, error, hasData }) {
  if (!loaded) {
    return (
      <div className="flex justify-center py-24">
        <span className="size-6 animate-spin rounded-full border-2 border-line border-t-accent" aria-label="Betöltés" />
      </div>
    );
  }
  if (error && !hasData) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="font-medium text-danger">Nem sikerült betölteni az adatokat.</p>
        <p className="mt-1 text-sm text-muted">{error}</p>
      </div>
    );
  }
  return null;
}

export function ErrorBanner({ error }) {
  if (!error) return null;
  return (
    <p className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-2 text-sm text-danger">
      Hiba a mentésnél: {error}
    </p>
  );
}
