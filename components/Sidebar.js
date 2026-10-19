import Link from "next/link";
import { LayoutDashboard, Library, BookOpen, Heart, Dices } from "lucide-react";
import NavLink from "./NavLink";

// Később ide jön: Naptár, Napló, digitális könyvtár
const links = [
  { href: "/", label: "Áttekintés", icon: LayoutDashboard },
  { href: "/library", label: "Könyvtár", icon: Library },
  { href: "/favorites", label: "Kedvencek", icon: Heart },
  { href: "/next", label: "Mi legyen a következő?", short: "Következő", icon: Dices },
];

export default function Sidebar() {
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
          {links.map(({ href, label, icon: Icon }) => (
            <NavLink
              key={href}
              href={href}
              className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted transition hover:bg-surface-2/60 hover:text-fg"
              activeClassName="bg-surface-2 text-fg! [&>svg]:text-accent"
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobil nézet: alsó menüsor */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-line bg-surface/95 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        {links.map(({ href, label, short, icon: Icon }) => (
          <NavLink
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 px-2 py-1 text-xs text-muted"
            activeClassName="text-accent!"
          >
            <Icon size={20} />
            {short ?? label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
