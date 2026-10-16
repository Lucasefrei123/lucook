"use client";

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
      className="border px-4 py-2 disabled:opacity-50"
    >
      {enCours ? "Vérification…" : "Relancer les contrôles"}
    </button>
  );
}