import { Clock, Flame, Users } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { formaterDuree, LIBELLES_DIFFICULTE, STYLES_MODE } from "@/lib/modes";
import type { LigneRecette, Mode } from "@/lib/recette";
import { cn } from "@/lib/utils";

export function MetaRecette({
  recette,
  className,
}: {
  recette: Pick<LigneRecette, "temps_minutes" | "difficulte" | "portions" | "macros">;
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground", className)}>
      <li className="flex items-center gap-1.5">
        <Clock className="size-3.5" aria-hidden="true" />
        <span className="sr-only">Temps :</span>
        {formaterDuree(recette.temps_minutes)}
      </li>
      <li className="flex items-center gap-1.5">
        <Users className="size-3.5" aria-hidden="true" />
        {recette.portions} {recette.portions > 1 ? "portions" : "portion"}
      </li>
      <li>{LIBELLES_DIFFICULTE[recette.difficulte]}</li>
      {recette.macros && (
        <li className="flex items-center gap-1.5">
          <Flame className="size-3.5" aria-hidden="true" />
          {Math.round(recette.macros.kcal)} kcal
        </li>
      )}
    </ul>
  );
}

export function CarteRecette({
  recette,
  mode,
  numero,
  grande = false,
  action,
  className,
}: {
  recette: LigneRecette;
  mode: Mode | null;
  numero?: number;
  grande?: boolean;
  action?: ReactNode;
  className?: string;
}) {
  const style = mode ? STYLES_MODE[mode] : null;
  const manquants = recette.ingredients.filter((ingredient) => ingredient.manquant).length;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col gap-4 bg-card p-5 transition-colors focus-within:bg-background hover:bg-background md:p-6",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {numero !== undefined && (
            <span className="font-mono text-xs text-muted-foreground">
              {String(numero).padStart(2, "0")}
            </span>
          )}
          {style && (
            <span className={cn("px-1.5 py-0.5 text-[0.7rem] font-medium tracking-wide uppercase", style.plein)}>
              {style.titre}
            </span>
          )}
        </div>
        {action && <div className="relative z-10 -mt-1.5 -mr-1.5">{action}</div>}
      </div>
      <div className="flex flex-col gap-2">
        <h3 className={cn("leading-snug", grande ? "text-2xl md:text-3xl" : "text-xl")}>
          <Link
            href={`/recettes/${recette.id}`}
            className="outline-none after:absolute after:inset-0 focus-visible:underline focus-visible:underline-offset-4"
          >
            {recette.titre}
          </Link>
        </h3>
        {recette.description && (
          <p className={cn("text-sm text-muted-foreground", grande ? "line-clamp-4 md:text-base" : "line-clamp-3")}>
            {recette.description}
          </p>
        )}
      </div>
      {grande && (
        <p className="text-sm">
          <span className="font-mono">{recette.ingredients.length}</span> ingrédients ·{" "}
          <span className="font-mono">{recette.etapes.length}</span> étapes
          {manquants > 0 && (
            <>
              {" "}
              · <span className="text-primary">{manquants} à acheter</span>
            </>
          )}
        </p>
      )}
      <div className="mt-auto flex flex-col gap-3">
        {recette.tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Étiquettes">
            {recette.tags.slice(0, grande ? 8 : 3).map((tag) => (
              <li key={tag} className="border border-cloison px-1.5 py-0.5 text-xs text-muted-foreground">
                {tag}
              </li>
            ))}
          </ul>
        )}
        <MetaRecette recette={recette} />
      </div>
    </article>
  );
}
