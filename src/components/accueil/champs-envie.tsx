import { idChamp, type ValeursEnvie } from "@/components/accueil/types";
import { Champ, Compteur } from "@/components/formulaire/champ";
import { ChoixSegmente } from "@/components/formulaire/choix-segmente";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ErreursChamps } from "@/lib/erreurs-formulaire";
import {
  BUDGETS,
  DIFFICULTES,
  LIBELLES_BUDGET,
  LIBELLES_DIFFICULTE,
  STYLES_MODE,
} from "@/lib/modes";
import { LIMITES } from "@/lib/recette";

const OPTIONS_BUDGET = [
  { valeur: null, libelle: "Peu importe" },
  ...BUDGETS.map((budget) => ({ valeur: budget, libelle: LIBELLES_BUDGET[budget] })),
];

const OPTIONS_DIFFICULTE = [
  { valeur: null, libelle: "Peu importe" },
  ...DIFFICULTES.map((difficulte) => ({
    valeur: difficulte,
    libelle: LIBELLES_DIFFICULTE[difficulte],
  })),
];

export function ChampsEnvie({
  valeurs,
  surChangement,
  erreurs,
  desactive,
}: {
  valeurs: ValeursEnvie;
  surChangement: (valeurs: ValeursEnvie) => void;
  erreurs: ErreursChamps;
  desactive: boolean;
}) {
  return (
    <fieldset disabled={desactive} className="grid gap-6 md:grid-cols-2">
      <Champ
        id={idChamp("envie")}
        libelle="De quoi as-tu envie ?"
        erreur={erreurs.envie}
        complement={<Compteur valeur={valeurs.envie} max={LIMITES.longueurTexteMax} />}
        className="md:row-span-2"
      >
        {(proprietes) => (
          <Textarea
            {...proprietes}
            rows={6}
            placeholder="Un plat réconfortant, plutôt asiatique, avec du croquant…"
            value={valeurs.envie}
            onChange={(e) => surChangement({ ...valeurs, envie: e.target.value })}
            className="min-h-36 bg-background"
          />
        )}
      </Champ>
      <Champ
        id={idChamp("tempsMax")}
        libelle="Temps maximum (minutes)"
        aide="Entre 5 et 240 minutes. Laisse vide si tu as le temps."
        erreur={erreurs.tempsMax}
      >
        {(proprietes) => (
          <Input
            {...proprietes}
            type="number"
            inputMode="numeric"
            min={5}
            max={240}
            step={5}
            placeholder="30"
            value={valeurs.tempsMax}
            onChange={(e) => surChangement({ ...valeurs, tempsMax: e.target.value })}
            className="h-10 bg-background font-mono"
          />
        )}
      </Champ>
      <div className="grid gap-6">
        <ChoixSegmente
          nom="budget"
          legende="Budget"
          options={OPTIONS_BUDGET}
          valeur={valeurs.budget}
          surChangement={(budget) => surChangement({ ...valeurs, budget })}
          classeCochee={STYLES_MODE.envie.coche}
          erreur={erreurs.budget}
        />
        <ChoixSegmente
          nom="difficulte"
          legende="Difficulté"
          options={OPTIONS_DIFFICULTE}
          valeur={valeurs.difficulte}
          surChangement={(difficulte) => surChangement({ ...valeurs, difficulte })}
          classeCochee={STYLES_MODE.envie.coche}
          erreur={erreurs.difficulte}
        />
      </div>
    </fieldset>
  );
}
