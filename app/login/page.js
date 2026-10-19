import { Suspense } from "react";
import { BookOpen } from "lucide-react";
import { signIn } from "@/auth";
import { param } from "@/lib/url";
import SubmitButton from "@/components/SubmitButton";

export const metadata = { title: "Belépés" };

// Belépés Keycloakkal: a gomb a Keycloak bejelentkező oldalára visz, onnan vissza a főoldalra
export default function LoginPage({ searchParams }) {
  async function login() {
    "use server";
    await signIn("keycloak", { redirectTo: "/" });
  }

  return (
    <div className="card mx-auto mt-16 flex max-w-sm flex-col items-center px-8 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-accent text-accent-ink">
        <BookOpen size={24} strokeWidth={2.2} />
      </span>
      <h1 className="mt-5 font-display text-3xl">
        Könyves<em className="text-accent">polc</em>
      </h1>
      <p className="mt-2 text-sm text-muted">Lépj be, hogy lásd a saját polcodat.</p>
      <Suspense>
        <LoginError searchParams={searchParams} />
      </Suspense>
      <form action={login} className="mt-8">
        <SubmitButton pendingText="Átirányítás…">Belépés</SubmitButton>
      </form>
    </div>
  );
}

// Az Auth.js hiba esetén ide irányít vissza (?error=…)
async function LoginError({ searchParams }) {
  const error = param((await searchParams).error);
  if (!error) return null;
  return (
    <p role="alert" className="mt-4 text-sm text-danger">
      {error === "AccessDenied"
        ? "Nincs jogosultságod a Könyvespolchoz. Kérj hozzáférést az adminisztrátortól."
        : "A belépés nem sikerült, próbáld újra."}
    </p>
  );
}
