import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import { db } from "@/lib/server/db";

const ACCESS_ROLE = "user";

// Belépés Keycloakkal (Auth.js). A beállítások környezeti változókból jönnek:
// AUTH_SECRET, AUTH_KEYCLOAK_ID, AUTH_KEYCLOAK_SECRET, AUTH_KEYCLOAK_ISSUER
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Keycloak],
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    // Csak akinek megvan a kliens "user" szerepköre (közvetlenül vagy csoporton keresztül), az léphet be.
    // A kliens szerepkörei alapból az access tokenben vannak; ezt a token végponttól kaptuk, ezért nem kell ellenőrizni.
    signIn({ account, profile }) {
      const token = JSON.parse(Buffer.from(account.access_token.split(".")[1], "base64url"));
      const roles = token.resource_access?.[process.env.AUTH_KEYCLOAK_ID]?.roles ?? [];
      if (roles.includes(ACCESS_ROLE)) return true;
      console.warn("[auth] belépés elutasítva:", profile?.preferred_username, "kliens szerepkörök:", roles);
      return false;
    },
    // A Keycloak felhasználó azonosítója (sub) a sessionbe – ehhez kötjük a könyveket
    session({ session, token }) {
      session.user.id = token.sub;
      return session;
    },
  },
  events: {
    // A belépés előtti (gazda nélküli) könyveket az első belépő felhasználó kapja meg.
    // shortcut: ha a realmben más lép be előbb, övé lesz a régi polc – több felhasználónál előbb te lépj be
    signIn({ user }) {
      db.prepare("UPDATE books SET user_id = ? WHERE user_id IS NULL").run(user.id);
    },
  },
});
