"use client";

import { PageErreur } from "@/components/page-erreur";

export default function ErreurProfil({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <PageErreur
      error={error}
      retry={retry}
      titre="Impossible de charger ton profil."
      texte="Tes préférences n'ont pas pu être chargées. Réessaie dans un instant."
    />
  );
}
