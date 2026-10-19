// Szűrő-linkek építése: a jelenlegi URL-paraméterekből egy újat készít,
// a megadott értékeket felülírva. Az üres értékek kimaradnak az URL-ből.
export function hrefWith(pathname, current, changes) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...current, ...changes })) {
    if (value !== undefined && value !== null && value !== "" && value !== false) params.set(key, String(value));
  }
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

// searchParams értékei lehetnek tömbök is (?a=1&a=2) – mi mindig az elsőt használjuk
export function param(value) {
  return Array.isArray(value) ? value[0] : value;
}
