import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SuiviGeneration, type GenerationSuivie } from "@/components/generation/suivi-generation";
import { COLONNES_GENERATION, COLONNES_RECETTE } from "@/lib/colonnes";
import { MOTIF_UUID } from "@/lib/modes";
import type { LigneRecette } from "@/lib/recette";
import { creerClientServeur } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Suivi de la génération",
};

export default async function PageGeneration({ params }: PageProps<"/generations/[id]">) {
  const { id } = await params;
  if (!MOTIF_UUID.test(id)) notFound();

  const supabase = await creerClientServeur();
  const [{ data: generation, error }, { data: recettes }] = await Promise.all([
    supabase.from("generations").select(COLONNES_GENERATION).eq("id", id).maybeSingle(),
    supabase
      .from("recettes")
      .select(COLONNES_RECETTE)
      .eq("generation_id", id)
      .order("created_at", { ascending: true }),
  ]);

  if (error) throw new Error("Impossible de charger la génération.");
  if (!generation) notFound();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 md:py-10">
      <SuiviGeneration
        key={id}
        generationInitiale={generation as GenerationSuivie}
        recettesInitiales={(recettes ?? []) as LigneRecette[]}
      />
    </main>
  );
}
