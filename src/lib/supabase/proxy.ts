import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_CLE_PUBLIQUE, SUPABASE_URL } from "./config";

const ROUTES_PUBLIQUES = ["/connexion", "/auth", "/api/jobs"];

export async function mettreAJourSession(request: NextRequest) {
  let reponse = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_CLE_PUBLIQUE, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesAEcrire) {
        cookiesAEcrire.forEach(({ name, value }) => request.cookies.set(name, value));
        reponse = NextResponse.next({ request });
        cookiesAEcrire.forEach(({ name, value, options }) =>
          reponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const chemin = request.nextUrl.pathname;
  const estPublique = ROUTES_PUBLIQUES.some((route) => chemin.startsWith(route));

  if (!user && !estPublique) {
    if (chemin.startsWith("/api/")) {
      return NextResponse.json({ erreur: "Tu dois être connecté." }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    url.searchParams.set("suivant", chemin);
    return NextResponse.redirect(url);
  }

  if (user && chemin === "/connexion") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return reponse;
}