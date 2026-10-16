"use client";

import { Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type KeyboardEvent } from "react";
import { toast } from "sonner";

import { Champ } from "@/components/formulaire/champ";
import { ChoixSegmente } from "@/components/formulaire/choix-segmente";
import { Input } from "@/components/ui/input";
import { LIBELLES_OBJECTIF, OBJECTIFS, STYLES_MODE, type Objectif } from "@/lib/modes";
import { creerClientNavigateur } from "@/lib/supabase/client";

const REGIMES = [
  "Végétarien",
  "Végétalien",
  "Pescétarien",
  "Sans gluten",
  "Sans lactose",
  "Halal",
  "Casher",
] as const;

const AUTRE = "autre";
const MAX_INGREDIENTS = 30;
const LONGUEUR_MAX = 50;

type ChoixRegime = (typeof REGIMES)[number] | typeof AUTRE;

const OPTIONS_REGIME = [
  { valeur: null, libelle: "Aucun" },
  ...REGIMES.map((regime) => ({ valeur: regime, libelle: regime })),
  { valeur: AUTRE, libelle: "Autre" },
] as const;

const OPTIONS_OBJECTIF = [
  { valeur: null, libelle: "Aucun" },
  ...OBJECTIFS.map((objectif) => ({ valeur: objectif, libelle: LIBELLES_OBJECTIF[objectif] })),
];

const CLASSE_COCHEE = "has-checked:bg-foreground has-checked:text-background";

function choixInitial(regime: string | null): { choix: ChoixRegime | null; libre: string } {
  if (!regime) return { choix: null, libre: "" };
  const connu = REGIMES.find((option) => option.toLowerCase() === regime.toLowerCase());
  return connu ? { choix: connu, libre: "" } : { choix: AUTRE, libre: regime };
}

export function FormulaireProfil({
  idUtilisateur,
  regime,
  ingredientsAEviter,
  objectifSport,
}: {
  idUtilisateur: string;
  regime: string | null;
  ingredientsAEviter: string[];
  objectifSport: Objectif | null;
}) {
  const router = useRouter();
  const initial = choixInitial(regime);
  const [choixRegime, setChoixRegime] = useState<ChoixRegime | null>(initial.choix);
  const [regimeLibre, setRegimeLibre] = useState(initial.libre);
  const [ingredients, setIngredients] = useState<string[]>(ingredientsAEviter);
  const [saisie, setSaisie] = useState("");
  const [objectif, setObjectif] = useState<Objectif | null>(objectifSport);
  const [erreurs, setErreurs] = useState<{ regime?: string; ingredient?: string }>({});
  const [envoi, setEnvoi] = useState(false);

  function ajouter() {
    const valeur = saisie.trim().replace(/\s+/g, " ");
    if (!valeur) return;
    if (valeur.length > LONGUEUR_MAX) {
      setErreurs((e) => ({ ...e, ingredient: `${LONGUEUR_MAX} caractères maximum.` }));
      return;
    }
    if (ingredients.some((ingredient) => ingredient.toLowerCase() === valeur.toLowerCase())) {
      setErreurs((e) => ({ ...e, ingredient: "Cet ingrédient est déjà dans la liste." }));
      return;
    }
    if (ingredients.length >= MAX_INGREDIENTS) {
      setErreurs((e) => ({ ...e, ingredient: `${MAX_INGREDIENTS} ingrédients maximum.` }));
      return;
    }
    setIngredients((precedents) => [...precedents, valeur]);
    setSaisie("");
    setErreurs((e) => ({ ...e, ingredient: undefined }));
  }

  function surTouche(evenement: KeyboardEvent<HTMLInputElement>) {
    if (evenement.key === "Enter") {
      evenement.preventDefault();
      ajouter();
    }
  }

  async function enregistrer(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const regimeFinal = choixRegime === AUTRE ? regimeLibre.trim() : choixRegime;
    if (choixRegime === AUTRE && !regimeFinal) {
      setErreurs({ regime: "Précise ton régime ou choisis « Aucun »." });
      document.getElementById("champ-regime-libre")?.focus();
      return;
    }
    if (regimeFinal && regimeFinal.length > LONGUEUR_MAX) {
      setErreurs({ regime: `${LONGUEUR_MAX} caractères maximum.` });
      return;
    }
    setErreurs({});
    setEnvoi(true);

    const { error } = await creerClientNavigateur()
      .from("profils")
      .update({
        regime: regimeFinal || null,
        ingredients_a_eviter: ingredients,
        objectif_sport: objectif,
      })
      .eq("user_id", idUtilisateur);

    setEnvoi(false);
    if (error) {
      toast.error("Impossible d'enregistrer ton profil. Réessaie.");
      return;
    }
    toast.success("Profil enregistré.");
    router.refresh();
  }

  return (
    <form noValidate onSubmit={enregistrer} className="grid gap-px border border-cloison bg-cloison">
      <section className="flex flex-col gap-4 bg-card p-5 md:p-8">
        <ChoixSegmente
          nom="regime"
          legende="Régime alimentaire"
          options={OPTIONS_REGIME}
          valeur={choixRegime}
          surChangement={setChoixRegime}
          classeCochee={CLASSE_COCHEE}
          classeGrille="grid-cols-3"
        />
        {choixRegime === AUTRE && (
          <Champ id="champ-regime-libre" libelle="Précise ton régime" erreur={erreurs.regime}>
            {(proprietes) => (
              <Input
                {...proprietes}
                value={regimeLibre}
                maxLength={LONGUEUR_MAX}
                onChange={(e) => setRegimeLibre(e.target.value)}
                placeholder="Flexitarien, pauvre en sel…"
                className="h-10 max-w-sm bg-background"
              />
            )}
          </Champ>
        )}
      </section>

      <section className="flex flex-col gap-4 bg-card p-5 md:p-8">
        <Champ
          id="champ-ingredient"
          libelle="Ingrédients à éviter"
          aide="Appuie sur Entrée pour ajouter. Lucook ne les proposera pas."
          erreur={erreurs.ingredient}
        >
          {(proprietes) => (
            <div className="flex max-w-md gap-2">
              <Input
                {...proprietes}
                value={saisie}
                onChange={(e) => setSaisie(e.target.value)}
                onKeyDown={surTouche}
                placeholder="Coriandre, champignons…"
                className="h-10 bg-background"
              />
              <button
                type="button"
                onClick={ajouter}
                className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[2px] border border-cloison px-3 text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/60"
              >
                <Plus className="size-4" aria-hidden="true" />
                Ajouter
              </button>
            </div>
          )}
        </Champ>
        {ingredients.length > 0 ? (
          <ul className="flex flex-wrap gap-2" aria-label="Ingrédients à éviter">
            {ingredients.map((ingredient) => (
              <li
                key={ingredient}
                className="flex items-center gap-1 border border-cloison bg-background py-1 pr-1 pl-2.5 text-sm"
              >
                {ingredient}
                <button
                  type="button"
                  onClick={() => setIngredients((precedents) => precedents.filter((i) => i !== ingredient))}
                  className="flex size-6 items-center justify-center rounded-[2px] text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
                >
                  <X className="size-3.5" aria-hidden="true" />
                  <span className="sr-only">Retirer {ingredient}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Aucun ingrédient à éviter pour l&apos;instant.</p>
        )}
      </section>

      <section className="bg-card p-5 md:p-8">
        <ChoixSegmente
          nom="objectif-sport"
          legende="Objectif sport par défaut"
          options={OPTIONS_OBJECTIF}
          valeur={objectif}
          surChangement={setObjectif}
          classeCochee={STYLES_MODE.sport.coche}
        />
      </section>

      <div className="flex justify-end bg-card p-4 md:px-8">
        <button
          type="submit"
          disabled={envoi}
          className="inline-flex h-11 items-center gap-2 rounded-[2px] bg-primary px-6 text-sm font-medium text-primary-foreground outline-none transition-colors hover:bg-primary/85 focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-wait disabled:opacity-80"
        >
          {envoi && <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
          {envoi ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
