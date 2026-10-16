import type { Recette } from "@/lib/recette";

type Macros = NonNullable<Recette["macros"]>;

const CASES = [
  { cle: "kcal", libelle: "Énergie", unite: "kcal" },
  { cle: "proteines", libelle: "Protéines", unite: "g" },
  { cle: "glucides", libelle: "Glucides", unite: "g" },
  { cle: "lipides", libelle: "Lipides", unite: "g" },
] as const;

export function BlocMacros({ macros }: { macros: Macros }) {
  return (
    <section aria-labelledby="titre-macros" className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="titre-macros" className="text-xl">
          Apports
        </h2>
        <p className="text-xs text-muted-foreground">valeurs estimées</p>
      </div>
      <dl className="grid grid-cols-2 gap-px border border-cloison bg-cloison">
        {CASES.map((element) => (
          <div key={element.cle} className="flex flex-col gap-1 bg-sport-doux p-3">
            <dt className="text-xs text-muted-foreground">{element.libelle}</dt>
            <dd className="font-mono text-lg">
              {Math.round(macros[element.cle])}
              <span className="ml-1 text-xs text-muted-foreground">{element.unite}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
