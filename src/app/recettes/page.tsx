import type { Metadata } from "next";

import { ListeRecettes, type RecetteListee } from "@/components/recettes/liste-recettes";
import { COLONNES_RECETTE } from "@/lib/colonnes";
import type { LigneRecette, Mode } from "@/lib/recette";
import { creerClientServeur } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Mes recettes",
};

type LigneAvecGeneration = LigneRecette & {
  generations: { mode: Mode } | { mode: Mode }[] | null;
};

export default async function PageRecettes() {
  const supabase = await creerClientServeur();
  const { data, error } = await supabase
    .from("recettes")
    .select(`${COLONNES_RECETTE}, generations(mode)`)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Impossible de charger tes recettes.");

  const recettes: RecetteListee[] = ((data ?? []) as LigneAvecGeneration[]).map(
    ({ generations, ...recette }) => ({
      ...recette,
      mode: (Array.isArray(generations) ? generations[0]?.mode : generations?.mode) ?? null,
    }),
  );

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 md:py-10">
      <header className="mb-6 flex flex-col gap-2">
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          Historique · <span className="tabular-nums">{recettes.length}</span> recette
          {recettes.length > 1 ? "s" : ""}
        </p>
        <h1 className="text-3xl md:text-4xl">Mes recettes</h1>
      </header>
      <ListeRecettes recettesInitiales={recettes} />
    </main>
  );
}
