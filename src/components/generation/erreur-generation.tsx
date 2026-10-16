"use client";

import { Loader2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { envoyerGeneration } from "@/lib/envoi-generation";
import { entreesSchema } from "@/lib/recette";

export function ErreurGeneration({ message, entrees }: { message: string | null; entrees: unknown }) {
  const router = useRouter();
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const analyse = entreesSchema.safeParse(entrees);

  async function reessayer() {
    if (!analyse.success) return;
    setEnvoi(true);
    setErreur(null);
    const resultat = await envoyerGeneration(analyse.data);
    if (resultat.type === "ok") {
      router.push(`/generations/${resultat.id}`);
      return;
    }
    setEnvoi(false);
    setErreur(resultat.erreur);
  }

  return (
    <div className="grid gap-px border border-cloison bg-cloison md:grid-cols-[auto_1fr]">
      <div className="flex items-center justify-center bg-envie-doux p-8 md:p-12" aria-hidden="true">
        <span className="grid size-16 place-items-center rounded-[2px] border-2 border-primary font-heading text-3xl text-primary">
          焦
        </span>
      </div>
      <div className="flex flex-col gap-4 bg-card p-6 md:p-10">
        <div role="alert" className="flex flex-col gap-2">
          <h2 className="text-2xl">La préparation a échoué.</h2>
          <p className="text-muted-foreground">
            {message ?? "Une erreur est survenue pendant la génération de tes recettes."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {analyse.success ? (
            <button
              type="button"
              onClick={reessayer}
              disabled={envoi}
              className="inline-flex h-10 items-center gap-2 rounded-[2px] bg-primary px-5 text-sm font-medium text-primary-foreground outline-none transition-colors hover:bg-primary/85 focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-wait disabled:opacity-80"
            >
              {envoi ? (
                <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
              ) : (
                <RotateCcw className="size-4" aria-hidden="true" />
              )}
              {envoi ? "Nouvel essai…" : "Réessayer"}
            </button>
          ) : null}
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-[2px] border border-cloison px-5 text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/60"
          >
            Modifier ma demande
          </Link>
        </div>
        {erreur && (
          <p role="alert" className="border-l-4 border-l-destructive pl-3 text-sm">
            {erreur}
          </p>
        )}
      </div>
    </div>
  );
}
