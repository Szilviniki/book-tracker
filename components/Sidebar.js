"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Library, Plus, BookOpen } from "lucide-react";

// Később ide jön: Áttekintés (dashboard), Naptár, Napló, Könyvtár
const links = [
  { href: "/", label: "Könyveim", icon: Library },
  { href: "/add", label: "Új könyv", icon: Plus },
];

function isActive(pathname, href) {
  if (href === "/") return pathname === "/" || pathname.startsWith("/books");
  return pathname.startsWith(href);
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Asztali nézet: oldalsáv */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-surface px-4 py-6 md:flex">
        <Link href="/" className="mb-10 flex items-center gap-2.5 px-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-ink">
            <BookOpen size={18} strokeWidth={2.2} />
          </span>
          <span className="font-display text-xl">Könyvespolc</span>
        </Link>
        <nav className="flex flex-col gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  active ? "bg-surface-2 text-fg" : "text-muted hover:bg-surface-2/60 hover:text-fg"
                }`}
              >
                <Icon size={18} className={active ? "text-accent" : ""} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobil nézet: alsó menüsor */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-line bg-surface/95 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        {links.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-4 py-1 text-xs ${active ? "text-accent" : "text-muted"}`}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
