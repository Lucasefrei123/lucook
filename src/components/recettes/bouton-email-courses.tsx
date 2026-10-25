"use client";

import { Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const MAX_RECETTES = 10;

const MESSAGES_PAR_DEFAUT: Record<number, string> = {
  401: "Ta session a expiré. Reconnecte-toi pour continuer.",
  404: "Certaines recettes sont introuvables. Recharge la page.",
  429: "Tu as atteint ta limite d'e-mails. Réessaie plus tard.",
  502: "L'e-mail n'a pas pu être envoyé. Réessaie dans un instant.",
  503: "L'envoi d'e-mails est momentanément indisponible.",
};

export function BoutonEmailCourses({ recetteIds }: { recetteIds: string[] }) {
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const trop = recetteIds.length > MAX_RECETTES;
  const desactive = envoi || recetteIds.length === 0 || trop;

  async function envoyer() {
    if (desactive) return;
    setEnvoi(true);
    setErreur(null);

    let message: string | null = null;
    try {
      const reponse = await fetch("/api/emails/liste-courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recetteIds }),
      });
      const corps = (await reponse.json().catch(() => null)) as
        | { destinataire?: string; erreur?: string }
        | null;

      if (reponse.ok) {
        toast.success(`E-mail envoyé${corps?.destinataire ? ` à ${corps.destinataire}` : ""}.`);
      } else {
        message =
          corps?.erreur ?? MESSAGES_PAR_DEFAUT[reponse.status] ?? "Une erreur inattendue est survenue. Réessaie.";
      }
    } catch {
      message = "Connexion impossible. Vérifie ton réseau et réessaie.";
    }

    setEnvoi(false);
    if (message) {
      setErreur(message);
      toast.error(message);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1 sm:items-end">
      <button
        type="button"
        onClick={envoyer}
        disabled={desactive}
        aria-describedby="email-aide"
        className="inline-flex min-h-10 items-center gap-2 rounded-[2px] bg-primary px-4 py-2 text-left text-sm font-medium text-primary-foreground outline-none transition-colors hover:bg-primary/85 focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-not-allowed disabled:opacity-50"
      >
        {envoi ? (
          <Loader2 className="size-4 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden="true" />
        ) : (
          <Mail className="size-4 shrink-0" aria-hidden="true" />
        )}
        {envoi ? "Envoi en cours…" : "Recevoir le résumé et la liste de courses par e-mail"}
      </button>
      {erreur ? (
        <span id="email-aide" role="alert" className="text-xs text-destructive">
          {erreur}
        </span>
      ) : (
        <span id="email-aide" className="text-xs text-muted-foreground">
          {trop
            ? `${MAX_RECETTES} recettes maximum par envoi.`
            : recetteIds.length === 0
              ? "Sélectionne une ou plusieurs recettes."
              : "Envoyé à l'adresse de ton compte."}
        </span>
      )}
    </div>
  );
}
