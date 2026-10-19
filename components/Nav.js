"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Később ide jön a "Napló" (reading journal) és a "Könyvtár" (digital library) is.
const links = [
  { href: "/", label: "Könyveim" },
  { href: "/add", label: "+ Új könyv" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-card">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="font-serif text-xl font-semibold">
          📚 Könyvespolc
        </Link>
        <ul className="flex gap-1">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  pathname === l.href
                    ? "bg-accent text-white"
                    : "text-muted hover:bg-accent-soft hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
