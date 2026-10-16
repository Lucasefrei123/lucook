"use client";

import { PageErreur } from "@/components/page-erreur";

export default function ErreurGeneration({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <PageErreur
      error={error}
      retry={retry}
      titre="Impossible de suivre cette génération."
      texte="Le suivi a été interrompu. Réessaie : tes recettes sont peut-être déjà prêtes."
    />
  );
}
