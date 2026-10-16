"use client";

import { PageErreur } from "@/components/page-erreur";

export default function ErreurRecettes({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <PageErreur
      error={error}
      retry={retry}
      titre="Impossible d'ouvrir ta boîte à recettes."
      texte="Tes recettes n'ont pas pu être chargées. Réessaie dans un instant."
    />
  );
}
