import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type ProprietesControle = {
  id: string;
  "aria-invalid": boolean | undefined;
  "aria-describedby": string | undefined;
};

export function ErreurChamp({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}

export function Champ({
  id,
  libelle,
  aide,
  erreur,
  complement,
  className,
  children,
}: {
  id: string;
  libelle: string;
  aide?: string;
  erreur?: string;
  complement?: ReactNode;
  className?: string;
  children: (proprietes: ProprietesControle) => ReactNode;
}) {
  const idAide = aide ? `${id}-aide` : undefined;
  const idErreur = erreur ? `${id}-erreur` : undefined;
  const decrit = [idAide, idErreur].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id}>{libelle}</Label>
        {complement}
      </div>
      {children({ id, "aria-invalid": erreur ? true : undefined, "aria-describedby": decrit })}
      {aide && (
        <p id={idAide} className="text-xs text-muted-foreground">
          {aide}
        </p>
      )}
      {idErreur && <ErreurChamp id={idErreur} message={erreur} />}
    </div>
  );
}

export function Compteur({ valeur, max }: { valeur: string; max: number }) {
  return (
    <span
      className={cn(
        "font-mono text-xs tabular-nums",
        valeur.length > max ? "text-destructive" : "text-muted-foreground",
      )}
    >
      {valeur.length}/{max}
    </span>
  );
}
