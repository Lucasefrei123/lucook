import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { FormulaireProfil } from "@/components/profil/formulaire-profil";
import { OBJECTIFS, type Objectif } from "@/lib/modes";
import { creerClientServeur } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Profil",
};

function estObjectif(valeur: unknown): valeur is Objectif {
  return OBJECTIFS.some((objectif) => objectif === valeur);
}

export default async function PageProfil() {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion?suivant=/profil");

  const { data: profil, error } = await supabase
    .from("profils")
    .select("regime, ingredients_a_eviter, objectif_sport")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw new Error("Impossible de charger ton profil.");

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 md:py-10">
      <header className="mb-6 flex flex-col gap-2">
        <p className="truncate font-mono text-xs tracking-widest text-muted-foreground uppercase">
          {user.email}
        </p>
        <h1 className="text-3xl md:text-4xl">Profil</h1>
        <p className="max-w-prose text-muted-foreground">
          Ces préférences sont transmises à chaque génération pour adapter tes recettes.
        </p>
      </header>
      <FormulaireProfil
        idUtilisateur={user.id}
        regime={profil?.regime ?? null}
        ingredientsAEviter={profil?.ingredients_a_eviter ?? []}
        objectifSport={estObjectif(profil?.objectif_sport) ? profil.objectif_sport : null}
      />
    </main>
  );
}
