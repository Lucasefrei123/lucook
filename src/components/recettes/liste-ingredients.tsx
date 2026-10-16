"use client";

import { useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import type { Recette } from "@/lib/recette";
import { cn } from "@/lib/utils";

type Ingredient = Recette["ingredients"][number];

function formaterQuantite(ingredient: Ingredient) {
  if (ingredient.quantite === null) return ingredient.unite ?? "";
  const nombre = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(ingredient.quantite);
  return ingredient.unite ? `${nombre} ${ingredient.unite}` : nombre;
}

export function ListeIngredients({ ingredients }: { ingredients: Ingredient[] }) {
  const [coches, setCoches] = useState<Set<number>>(new Set());
  const manquants = ingredients.filter((ingredient) => ingredient.manquant).length;

  function basculer(index: number, coche: boolean) {
    setCoches((precedents) => {
      const suivants = new Set(precedents);
      if (coche) suivants.add(index);
      else suivants.delete(index);
      return suivants;
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-xl">Ingrédients</h2>
        <p className="font-mono text-xs text-muted-foreground" aria-live="polite">
          {coches.size}/{ingredients.length} prêts
        </p>
      </div>
      {manquants > 0 && (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-primary">{manquants}</span> ingrédient
          {manquants > 1 ? "s" : ""} à acheter, signalé{manquants > 1 ? "s" : ""} en vermillon.
        </p>
      )}
      <ul className="flex flex-col divide-y divide-cloison border-y border-cloison">
        {ingredients.map((ingredient, index) => {
          const coche = coches.has(index);
          const id = `ingredient-${index}`;
          return (
            <li
              key={`${ingredient.nom}-${index}`}
              className={cn("flex items-center gap-3 py-2.5", ingredient.manquant && "border-l-2 border-l-primary pl-2.5")}
            >
              <Checkbox
                id={id}
                checked={coche}
                onCheckedChange={(valeur) => basculer(index, valeur === true)}
              />
              <label
                htmlFor={id}
                className={cn(
                  "flex flex-1 cursor-pointer flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-sm",
                  coche && "text-muted-foreground line-through",
                )}
              >
                <span>
                  {ingredient.nom}
                  {ingredient.manquant && (
                    <span className="ml-2 bg-primary px-1.5 py-0.5 text-[0.7rem] font-medium text-primary-foreground no-underline">
                      à acheter
                    </span>
                  )}
                </span>
                <span className="font-mono text-xs text-muted-foreground">{formaterQuantite(ingredient)}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
