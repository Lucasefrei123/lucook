"use client";

import { PageErreur } from "@/components/page-erreur";

export default function ErreurGlobale({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <PageErreur
      error={error}
      retry={retry}
    />
  );
}
