import { idChamp, type ValeursSport } from "@/components/accueil/types";
import { Champ, Compteur } from "@/components/formulaire/champ";
import { ChoixSegmente } from "@/components/formulaire/choix-segmente";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ErreursChamps } from "@/lib/erreurs-formulaire";
import { LIBELLES_OBJECTIF, OBJECTIFS, STYLES_MODE } from "@/lib/modes";

const OPTIONS_OBJECTIF = [
  { valeur: null, libelle: "Aucun" },
  ...OBJECTIFS.map((objectif) => ({ valeur: objectif, libelle: LIBELLES_OBJECTIF[objectif] })),
];

const CIBLES = [
  { cle: "kcal", libelle: "Énergie", unite: "kcal", max: 3000, exemple: "650" },
  { cle: "proteines", libelle: "Protéines", unite: "g", max: 300, exemple: "40" },
  { cle: "glucides", libelle: "Glucides", unite: "g", max: 500, exemple: "70" },
  { cle: "lipides", libelle: "Lipides", unite: "g", max: 200, exemple: "20" },
] as const;

const MAX_PRECISIONS = 300;

export function ChampsSport({
  valeurs,
  surChangement,
  erreurs,
  desactive,
}: {
  valeurs: ValeursSport;
  surChangement: (valeurs: ValeursSport) => void;
  erreurs: ErreursChamps;
  desactive: boolean;
}) {
  return (
    <fieldset disabled={desactive} className="grid gap-6">
      <div id={idChamp("objectif")} tabIndex={-1} className="outline-none">
        <ChoixSegmente
          nom="objectif"
          legende="Objectif"
          options={OPTIONS_OBJECTIF}
          valeur={valeurs.objectif}
          surChangement={(objectif) => surChangement({ ...valeurs, objectif })}
          classeCochee={STYLES_MODE.sport.coche}
          erreur={erreurs.objectif}
        />
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">
          Apports cibles par portion{" "}
          <span className="font-normal text-muted-foreground">(facultatif)</span>
        </legend>
        <div className="grid grid-cols-2 gap-px border border-cloison bg-cloison sm:grid-cols-4">
          {CIBLES.map((cible) => (
            <Champ
              key={cible.cle}
              id={idChamp(`cibles.${cible.cle}`)}
              libelle={`${cible.libelle} (${cible.unite})`}
              erreur={erreurs[`cibles.${cible.cle}`]}
              className="bg-card p-3"
            >
              {(proprietes) => (
                <Input
                  {...proprietes}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={cible.max}
                  placeholder={cible.exemple}
                  value={valeurs[cible.cle]}
                  onChange={(e) => surChangement({ ...valeurs, [cible.cle]: e.target.value })}
                  className="h-10 bg-background font-mono"
                />
              )}
            </Champ>
          ))}
        </div>
      </fieldset>
      <Champ
        id={idChamp("precisions")}
        libelle="Précisions"
        aide="Allergies, matériel, moment de la journée…"
        erreur={erreurs.precisions}
        complement={<Compteur valeur={valeurs.precisions} max={MAX_PRECISIONS} />}
      >
        {(proprietes) => (
          <Textarea
            {...proprietes}
            rows={3}
            placeholder="Repas d'après séance, sans lactose, prêt en 20 minutes…"
            value={valeurs.precisions}
            onChange={(e) => surChangement({ ...valeurs, precisions: e.target.value })}
            className="bg-background"
          />
        )}
      </Champ>
    </fieldset>
  );
}
