"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export function PageErreur({
  error,
  retry,
  titre = "Quelque chose a brûlé en cuisine.",
  texte = "Une erreur inattendue est survenue. Réessaie, ou reviens à l'accueil.",
}: {
  error: unknown;
  retry: () => void;
  titre?: string;
  texte?: string;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const reference = error instanceof Error && "digest" in error ? String(error.digest) : null;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 md:py-16">
      <div className="grid gap-px border border-cloison bg-cloison md:grid-cols-[auto_1fr]">
        <div className="flex items-center justify-center bg-envie-doux p-8 md:p-12" aria-hidden="true">
          <span className="grid size-20 place-items-center rounded-[2px] border-2 border-primary font-heading text-4xl text-primary">
            焦
          </span>
        </div>
        <div role="alert" className="flex flex-col gap-4 bg-card p-6 md:p-10">
          <h1 className="text-2xl md:text-3xl">{titre}</h1>
          <p className="max-w-prose text-muted-foreground">{texte}</p>
          {reference && (
            <p className="font-mono text-xs text-muted-foreground">Référence : {reference}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => retry()}
              className="inline-flex h-10 items-center gap-2 rounded-[2px] bg-primary px-5 text-sm font-medium text-primary-foreground outline-none transition-colors hover:bg-primary/85 focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Réessayer
            </button>
            <Link
              href="/"
              className="inline-flex h-10 items-center rounded-[2px] border border-cloison px-5 text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/60"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
