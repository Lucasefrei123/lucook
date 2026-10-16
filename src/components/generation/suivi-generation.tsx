"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState } from "react";

import { AttentePreparation } from "@/components/generation/attente-preparation";
import { BentoRecettes } from "@/components/generation/bento-recettes";
import { ErreurGeneration } from "@/components/generation/erreur-generation";
import { COLONNES_GENERATION, COLONNES_RECETTE } from "@/lib/colonnes";
import { formaterDate, STYLES_MODE } from "@/lib/modes";
import type { LigneGeneration, LigneRecette, StatutGeneration } from "@/lib/recette";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export type GenerationSuivie = LigneGeneration & { created_at: string };

const ANNONCES: Record<StatutGeneration, string> = {
  en_attente: "Ta demande est en file d'attente.",
  en_cours: "Tes recettes sont en préparation.",
  terminee: "Tes trois recettes sont prêtes.",
  erreur: "La génération a échoué.",
};

function estTerminal(statut: StatutGeneration) {
  return statut === "terminee" || statut === "erreur";
}

export function SuiviGeneration({
  generationInitiale,
  recettesInitiales,
}: {
  generationInitiale: GenerationSuivie;
  recettesInitiales: LigneRecette[];
}) {
  const [generation, setGeneration] = useState(generationInitiale);
  const [recettes, setRecettes] = useState(recettesInitiales);
  const id = generationInitiale.id;
  const termineeDesLeDebut = estTerminal(generationInitiale.statut);
  const style = STYLES_MODE[generation.mode];

  useEffect(() => {
    if (termineeDesLeDebut) return;

    const supabase = creerClientNavigateur();
    let actif = true;
    let canal: RealtimeChannel | null = null;

    async function chargerRecettes() {
      const { data } = await supabase
        .from("recettes")
        .select(COLONNES_RECETTE)
        .eq("generation_id", id)
        .order("created_at", { ascending: true });
      if (actif && data) setRecettes(data as LigneRecette[]);
    }

    function appliquer(ligne: Partial<GenerationSuivie>) {
      if (!actif) return;
      setGeneration((precedente) => ({ ...precedente, ...ligne }));
      if (ligne.statut === "terminee") void chargerRecettes();
    }

    async function relire() {
      const { data } = await supabase
        .from("generations")
        .select(COLONNES_GENERATION)
        .eq("id", id)
        .maybeSingle();
      if (data) appliquer(data as GenerationSuivie);
    }

    async function sAbonner() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!actif) return;
      if (session) await supabase.realtime.setAuth(session.access_token);
      if (!actif) return;

      canal = supabase
        .channel(`generation:${id}`)
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "generations", filter: `id=eq.${id}` },
          (charge) => appliquer(charge.new as Partial<GenerationSuivie>),
        )
        .subscribe((etat) => {
          if (etat === "SUBSCRIBED") void relire();
        });
    }

    void sAbonner();

    return () => {
      actif = false;
      if (canal) void supabase.removeChannel(canal);
    };
  }, [id, termineeDesLeDebut]);

  const date = formaterDate(generation.created_at);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-2 text-xs">
            <span className={cn("px-1.5 py-0.5 font-medium tracking-wide uppercase", style.plein)}>
              {style.titre}
            </span>
            <span className="font-mono text-muted-foreground">{date}</span>
          </p>
          <h1 className="text-3xl md:text-4xl">
            {generation.statut === "terminee" ? "Tes trois recettes" : "Ta commande"}
          </h1>
        </div>
        {generation.statut === "terminee" && (
          <Link
            href="/"
            className="text-sm text-primary underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            Nouvelle génération
          </Link>
        )}
      </header>

      <p className="sr-only" aria-live="polite">
        {ANNONCES[generation.statut]}
      </p>

      {(generation.statut === "en_attente" || generation.statut === "en_cours") && (
        <AttentePreparation mode={generation.mode} enCours={generation.statut === "en_cours"} />
      )}

      {generation.statut === "terminee" &&
        (recettes.length > 0 ? (
          <BentoRecettes recettes={recettes} mode={generation.mode} />
        ) : (
          <p className="border border-cloison bg-card p-6 text-muted-foreground">
            Les recettes arrivent… Actualise la page si elles n&apos;apparaissent pas.
          </p>
        ))}

      {generation.statut === "erreur" && (
        <ErreurGeneration message={generation.message_erreur} entrees={generation.entrees} />
      )}
    </div>
  );
}
