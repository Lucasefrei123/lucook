import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_CLE_PUBLIQUE, SUPABASE_URL } from "./config";

export async function creerClientServeur() {
  const magasinCookies = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_CLE_PUBLIQUE, {
    cookies: {
      getAll() {
        return magasinCookies.getAll();
      },
      setAll(cookiesAEcrire) {
        try {
          cookiesAEcrire.forEach(({ name, value, options }) =>
            magasinCookies.set(name, value, options),
          );
        } catch {}
      },
    },
  });
}