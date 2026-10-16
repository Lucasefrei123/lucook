import { ErreurChamp } from "@/components/formulaire/champ";
import { cn } from "@/lib/utils";

export type OptionSegment<T extends string> = {
  valeur: T | null;
  libelle: string;
};

export function ChoixSegmente<T extends string>({
  nom,
  legende,
  options,
  valeur,
  surChangement,
  classeCochee,
  erreur,
}: {
  nom: string;
  legende: string;
  options: readonly OptionSegment<T>[];
  valeur: T | null;
  surChangement: (valeur: T | null) => void;
  classeCochee: string;
  erreur?: string;
}) {
  const idErreur = erreur ? `${nom}-erreur` : undefined;

  return (
    <fieldset className="flex flex-col gap-2" aria-describedby={idErreur}>
      <legend className="mb-2 text-sm font-medium">{legende}</legend>
      <div
        className={cn(
          "grid gap-px border bg-cloison",
          options.length > 3 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3",
          erreur ? "border-destructive" : "border-cloison",
        )}
      >
        {options.map((option) => (
          <label
            key={option.valeur ?? "aucun"}
            className={cn(
              "flex min-h-10 cursor-pointer items-center justify-center bg-card px-2 py-2 text-center text-sm transition-colors hover:bg-muted has-focus-visible:relative has-focus-visible:z-10 has-focus-visible:ring-3 has-focus-visible:ring-ring/60",
              classeCochee,
            )}
          >
            <input
              type="radio"
              name={nom}
              className="sr-only"
              checked={valeur === option.valeur}
              onChange={() => surChangement(option.valeur)}
            />
            {option.libelle}
          </label>
        ))}
      </div>
      {idErreur && <ErreurChamp id={idErreur} message={erreur} />}
    </fieldset>
  );
}
