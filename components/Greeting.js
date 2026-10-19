"use client";

// Napszaknak megfelelő köszöntés és dátum a böngésző saját órája szerint.
// Kliens komponens, mert a szerver (pl. Dockerben) más időzónában lehet.
import { useSyncExternalStore } from "react";
import { PageHeader } from "./ui";

const subscribe = () => () => {};

function greeting(hour) {
  if (hour < 5) return ["Jó", "éjszakát"];
  if (hour < 10) return ["Jó", "reggelt"];
  if (hour < 18) return ["Szép", "napot"];
  return ["Jó", "estét"];
}

export default function Greeting({ children }) {
  // A szerveren null (nem tudjuk a látogató idejét), a böngészőben az aktuális óra
  const hour = useSyncExternalStore(subscribe, () => new Date().getHours(), () => null);

  if (hour === null) return <PageHeader title="Könyveim">{children}</PageHeader>;

  const [title, accent] = greeting(hour);
  const date = new Date().toLocaleDateString("hu-HU", { month: "long", day: "numeric", weekday: "long" });
  return (
    <PageHeader eyebrow={date} title={title} accent={accent}>
      {children}
    </PageHeader>
  );
}
