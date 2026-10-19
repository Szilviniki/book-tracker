import { connection } from "next/server";
import { LogOut } from "lucide-react";
import { auth, signOut } from "@/auth";

// A belépett felhasználó neve és a kilépés gomb (kilépve nem jelenik meg).
// Csak a saját sütinket törli; a Keycloak munkamenet megmarad, így az újbóli belépés gyors.
export default async function UserMenu({ mobile = false }) {
  await connection();
  const session = await auth();
  if (!session) return null;

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  if (mobile) {
    return (
      <form action={logout}>
        <button className="flex flex-col items-center gap-1 px-2 py-1 text-xs text-muted">
          <LogOut size={20} />
          Kilépés
        </button>
      </form>
    );
  }

  return (
    <form action={logout} className="mt-auto flex items-center gap-2 border-t border-line px-3 pt-4">
      <span className="min-w-0 flex-1 truncate text-sm text-muted">{session.user.name ?? session.user.email}</span>
      <button title="Kilépés" aria-label="Kilépés" className="rounded-lg p-2 text-muted transition hover:bg-surface-2/60 hover:text-fg">
        <LogOut size={18} />
      </button>
    </form>
  );
}
