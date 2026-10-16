import { Suspense } from "react";
import { creerClientServeur } from "@/lib/supabase/server";

async function InfosUtilisateur() {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profil } = await supabase
    .from("profils")
    .select("role")
    .eq("user_id", user!.id)
    .single();

  return (
    <>
      <p>Connecté en tant que {user?.email}</p>
      <p>Rôle : {profil?.role ?? "inconnu"}</p>
    </>
  );
}

export default function Accueil() {
  return (
    <main className="p-8">
      <Suspense fallback={<p>Chargement…</p>}>
        <InfosUtilisateur />
      </Suspense>
      <form action="/auth/deconnexion" method="post">
        <button type="submit" className="underline">
          Se déconnecter
        </button>
      </form>
    </main>
  );
}
