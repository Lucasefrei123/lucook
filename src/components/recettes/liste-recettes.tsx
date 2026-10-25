"use client";

import { Heart } from "lucide-react";
import { useMemo, useState } from "react";

import { BoutonEmailCourses } from "@/components/recettes/bouton-email-courses";
import { BoutonFavori } from "@/components/recettes/bouton-favori";
import { CarteRecette } from "@/components/recettes/carte-recette";
import { EtatVide } from "@/components/recettes/etat-vide";
import { Checkbox } from "@/components/ui/checkbox";
import { STYLES_MODE } from "@/lib/modes";
import { MODES, type LigneRecette, type Mode } from "@/lib/recette";
import { cn } from "@/lib/utils";

export type RecetteListee = LigneRecette & { mode: Mode | null };

type FiltreMode = Mode | "tous";

const OPTIONS_MODE: { valeur: FiltreMode; libelle: string; coche: string }[] = [
  { valeur: "tous", libelle: "Tous", coche: "has-checked:bg-foreground has-checked:text-background" },
  ...MODES.map((mode) => ({ valeur: mode, libelle: STYLES_MODE[mode].titre, coche: STYLES_MODE[mode].coche })),
];

export function ListeRecettes({ recettesInitiales }: { recettesInitiales: RecetteListee[] }) {
  const [recettes, setRecettes] = useState(recettesInitiales);
  const [filtreMode, setFiltreMode] = useState<FiltreMode>("tous");
  const [favorisSeuls, setFavorisSeuls] = useState(false);
  const [selection, setSelection] = useState<Set<string>>(new Set());

  const visibles = useMemo(
    () =>
      recettes.filter(
        (recette) =>
          (filtreMode === "tous" || recette.mode === filtreMode) && (!favorisSeuls || recette.favori),
      ),
    [recettes, filtreMode, favorisSeuls],
  );

  const idsSelectionnes = useMemo(
    () => recettes.filter((recette) => selection.has(recette.id)).map((recette) => recette.id),
    [recettes, selection],
  );

  const toutesVisiblesSelectionnees =
    visibles.length > 0 && visibles.every((recette) => selection.has(recette.id));

  function changerFavori(id: string, favori: boolean) {
    setRecettes((precedentes) =>
      precedentes.map((recette) => (recette.id === id ? { ...recette, favori } : recette)),
    );
  }

  function basculerSelection(id: string, coche: boolean) {
    setSelection((precedente) => {
      const suivante = new Set(precedente);
      if (coche) suivante.add(id);
      else suivante.delete(id);
      return suivante;
    });
  }

  function basculerToutes() {
    setSelection((precedente) => {
      const suivante = new Set(precedente);
      for (const recette of visibles) {
        if (toutesVisiblesSelectionnees) suivante.delete(recette.id);
        else suivante.add(recette.id);
      }
      return suivante;
    });
  }

  if (recettes.length === 0) {
    return (
      <EtatVide
        titre="Ta boîte est encore vide."
        texte="Tes recettes générées s'empileront ici, compartiment par compartiment. Lance ta première génération depuis l'accueil."
        lien={{ href: "/", libelle: "Composer mes premières recettes" }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div className="grid gap-px border border-cloison bg-cloison md:grid-cols-[1fr_auto]">
        <fieldset className="bg-card p-3">
          <legend className="sr-only">Filtrer par mode</legend>
          <div className="grid grid-cols-4 gap-px border border-cloison bg-cloison">
            {OPTIONS_MODE.map((option) => (
              <label
                key={option.valeur}
                className={cn(
                  "flex h-9 cursor-pointer items-center justify-center bg-card px-2 text-sm transition-colors hover:bg-muted has-focus-visible:relative has-focus-visible:z-10 has-focus-visible:ring-3 has-focus-visible:ring-ring/60",
                  option.coche,
                )}
              >
                <input
                  type="radio"
                  name="filtre-mode"
                  className="sr-only"
                  checked={filtreMode === option.valeur}
                  onChange={() => setFiltreMode(option.valeur)}
                />
                {option.libelle}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex items-center gap-2 bg-card p-3">
          <button
            type="button"
            aria-pressed={favorisSeuls}
            onClick={() => setFavorisSeuls((valeur) => !valeur)}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-[2px] border px-3 text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/60",
              favorisSeuls
                ? "border-primary bg-primary text-primary-foreground"
                : "border-cloison hover:bg-muted",
            )}
          >
            <Heart className={cn("size-4", favorisSeuls && "fill-current")} aria-hidden="true" />
            Favoris
          </button>
          <button
            type="button"
            onClick={basculerToutes}
            disabled={visibles.length === 0}
            className="inline-flex h-9 items-center rounded-[2px] border border-cloison px-3 text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/60 disabled:opacity-50"
          >
            {toutesVisiblesSelectionnees ? "Tout désélectionner" : "Tout sélectionner"}
          </button>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {visibles.length} recette{visibles.length > 1 ? "s" : ""} affichée{visibles.length > 1 ? "s" : ""}
      </p>

      {visibles.length === 0 ? (
        <EtatVide
          titre="Aucune recette ici."
          texte={
            favorisSeuls
              ? "Aucun favori ne correspond à ce filtre. Touche le cœur d'une recette pour l'ajouter."
              : "Aucune recette pour ce mode pour l'instant."
          }
        />
      ) : (
        <ul className="grid gap-px border border-cloison bg-cloison sm:grid-cols-2 lg:grid-cols-3">
          {visibles.map((recette) => {
            const selectionnee = selection.has(recette.id);
            return (
              <li key={recette.id} className={cn("flex", selectionnee && "ring-2 ring-primary ring-inset")}>
                <CarteRecette
                  recette={recette}
                  mode={recette.mode}
                  className={cn("w-full", selectionnee && "bg-envie-doux hover:bg-envie-doux")}
                  action={
                    <div className="flex items-center gap-1">
                      <label className="flex size-9 cursor-pointer items-center justify-center rounded-[2px] hover:bg-muted">
                        <Checkbox
                          checked={selectionnee}
                          onCheckedChange={(coche) => basculerSelection(recette.id, coche === true)}
                          aria-label={`Sélectionner « ${recette.titre} »`}
                        />
                      </label>
                      <BoutonFavori
                        recetteId={recette.id}
                        titre={recette.titre}
                        favori={recette.favori}
                        surChangement={(favori) => changerFavori(recette.id, favori)}
                      />
                    </div>
                  }
                />
              </li>
            );
          })}
        </ul>
      )}

      <div className="sticky bottom-4 z-20 mt-auto">
        <div className="flex flex-col gap-3 border border-cloison bg-card/95 p-3 shadow-[0_8px_24px_-12px_rgb(31_29_26/0.35)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm" aria-live="polite">
            <span className="font-mono">{selection.size}</span> recette{selection.size > 1 ? "s" : ""}{" "}
            sélectionnée{selection.size > 1 ? "s" : ""}
            {selection.size > 0 && (
              <button
                type="button"
                onClick={() => setSelection(new Set())}
                className="ml-3 text-muted-foreground underline underline-offset-4 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
              >
                Vider
              </button>
            )}
          </p>
          <BoutonEmailCourses recetteIds={idsSelectionnes} />
        </div>
      </div>
    </div>
  );
}
