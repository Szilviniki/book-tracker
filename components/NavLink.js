"use client";

// Menülink, ami kiemeli magát, ha az aktuális oldalra mutat (ehhez kell usePathname).
import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function isActive(pathname, href) {
  if (href === "/") return pathname === "/" || pathname.startsWith("/books");
  return pathname.startsWith(href);
}

function ActiveAwareLink({ href, className, activeClassName, children }) {
  const active = isActive(usePathname(), href);
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={`${className} ${active ? activeClassName : ""}`}>
      {children}
    </Link>
  );
}

// A dinamikus útvonalakon (pl. /books/[id]) az útvonal csak kéréskor ismert,
// ezért addig kiemelés nélküli linket mutatunk.
export default function NavLink(props) {
  return (
    <Suspense
      fallback={
        <Link href={props.href} className={props.className}>
          {props.children}
        </Link>
      }
    >
      <ActiveAwareLink {...props} />
    </Suspense>
  );
}
