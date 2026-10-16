import Link from "next/link";
import { redirect } from "next/navigation";

import { FormulaireGeneration } from "@/components/accueil/formulaire-generation";
import { OBJECTIFS, type Objectif } from "@/lib/modes";
import { creerClientServeur } from "@/lib/supabase/server";

function estObjectif(valeur: unknown): valeur is Objectif {
  return OBJECTIFS.some((objectif) => objectif === valeur);
}

export default async function Accueil() {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: profil } = await supabase
    .from("profils")
    .select("regime, ingredients_a_eviter, objectif_sport")
    .eq("user_id", user.id)
    .maybeSingle();

  const aEviter: string[] = profil?.ingredients_a_eviter ?? [];
  const objectif = estObjectif(profil?.objectif_sport) ? profil.objectif_sport : null;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 md:py-10">
      <div className="mb-6 grid gap-px border border-cloison bg-cloison md:grid-cols-3">
        <section className="bg-card p-6 md:col-span-2 md:p-8">
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            Aujourd&apos;hui en cuisine
          </p>
          <h1 className="mt-3 text-3xl leading-tight md:text-4xl">Qu&apos;est-ce qu&apos;on mange ?</h1>
          <p className="mt-3 max-w-prose text-muted-foreground">
            Choisis un point de départ : ton frigo, une envie ou un objectif sportif. Lucook compose trois
            recettes, chacune dans son compartiment.
          </p>
        </section>
        <aside aria-labelledby="titre-preferences" className="flex flex-col gap-3 bg-card p-6">
          <h2 id="titre-preferences" className="text-lg">
            Tes préférences
          </h2>
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Régime</dt>
              <dd>{profil?.regime || "Aucun"}</dd>
            </div>
            <div className="flex flex-col gap-1.5">
              <dt className="text-muted-foreground">À éviter</dt>
              <dd className="flex flex-wrap gap-1.5">
                {aEviter.length ? (
                  aEviter.map((ingredient) => (
                    <span key={ingredient} className="border border-cloison bg-background px-2 py-0.5 text-xs">
                      {ingredient}
                    </span>
                  ))
                ) : (
                  <span>Rien</span>
                )}
              </dd>
            </div>
          </dl>
          <Link
            href="/profil"
            className="mt-auto text-sm text-primary underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            Modifier mon profil
          </Link>
        </aside>
      </div>
      <FormulaireGeneration idUtilisateur={user.id} objectifParDefaut={objectif} />
    </main>
  );
}
