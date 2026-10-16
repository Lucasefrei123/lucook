"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { creerClientNavigateur } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function BoutonFavori({
  recetteId,
  titre,
  favori,
  surChangement,
  avecLibelle = false,
}: {
  recetteId: string;
  titre: string;
  favori: boolean;
  surChangement?: (favori: boolean) => void;
  avecLibelle?: boolean;
}) {
  const [local, setLocal] = useState(favori);
  const [envoi, setEnvoi] = useState(false);
  const actuel = surChangement ? favori : local;

  function appliquer(valeur: boolean) {
    if (surChangement) surChangement(valeur);
    else setLocal(valeur);
  }

  async function basculer() {
    const suivant = !actuel;
    appliquer(suivant);
    setEnvoi(true);
    const { error } = await creerClientNavigateur()
      .from("recettes")
      .update({ favori: suivant })
      .eq("id", recetteId);
    setEnvoi(false);
    if (error) {
      appliquer(!suivant);
      toast.error("Impossible de mettre à jour tes favoris. Réessaie.");
      return;
    }
    toast.success(suivant ? "Ajoutée à tes favoris." : "Retirée de tes favoris.");
  }

  return (
    <button
      type="button"
      onClick={basculer}
      disabled={envoi}
      aria-pressed={actuel}
      aria-label={avecLibelle ? undefined : `${actuel ? "Retirer" : "Ajouter"} « ${titre} » ${actuel ? "des" : "aux"} favoris`}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[2px] outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/60 disabled:opacity-70",
        avecLibelle ? "h-10 border border-cloison px-4 text-sm hover:bg-muted" : "size-9 hover:bg-muted",
        actuel ? "text-primary" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Heart className={cn("size-4", actuel && "fill-current")} aria-hidden="true" />
      {avecLibelle && (actuel ? "Dans mes favoris" : "Ajouter aux favoris")}
    </button>
  );
}
