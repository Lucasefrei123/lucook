import { DepotPhoto } from "@/components/accueil/depot-photo";
import { idChamp, type ValeursFrigo } from "@/components/accueil/types";
import { Champ, Compteur } from "@/components/formulaire/champ";
import { Textarea } from "@/components/ui/textarea";
import type { ErreursChamps } from "@/lib/erreurs-formulaire";
import { LIMITES } from "@/lib/recette";

export function ChampsFrigo({
  valeurs,
  surChangement,
  erreurs,
  desactive,
}: {
  valeurs: ValeursFrigo;
  surChangement: (valeurs: ValeursFrigo) => void;
  erreurs: ErreursChamps;
  desactive: boolean;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Champ
        id={idChamp("ingredients")}
        libelle="Ce qu'il y a dans ton frigo"
        aide="Sépare les ingrédients par des virgules. Indique-les et/ou ajoute une photo."
        erreur={erreurs.ingredients}
        complement={<Compteur valeur={valeurs.ingredients} max={LIMITES.longueurTexteMax} />}
      >
        {(proprietes) => (
          <Textarea
            {...proprietes}
            rows={6}
            placeholder="3 œufs, un reste de riz, poireaux, parmesan…"
            value={valeurs.ingredients}
            disabled={desactive}
            onChange={(e) => surChangement({ ...valeurs, ingredients: e.target.value })}
            className="min-h-36 bg-background"
          />
        )}
      </Champ>
      <DepotPhoto
        photo={valeurs.photo}
        surChangement={(photo) => surChangement({ ...valeurs, photo })}
        erreur={erreurs.cheminPhoto}
        desactive={desactive}
      />
    </div>
  );
}
