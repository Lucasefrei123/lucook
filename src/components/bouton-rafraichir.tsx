"use client";

import { Loader2, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function BoutonRafraichir() {
  const router = useRouter();
  const [enCours, demarrer] = useTransition();

  return (
    <button
      type="button"
      onClick={() => demarrer(() => router.refresh())}
      disabled={enCours}
      className="inline-flex h-10 items-center gap-2 rounded-[2px] border border-cloison bg-card px-4 text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/60 disabled:opacity-50"
    >
      {enCours ? (
        <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
      ) : (
        <RotateCcw className="size-4" aria-hidden="true" />
      )}
      {enCours ? "Vérification…" : "Relancer les contrôles"}
    </button>
  );
}
