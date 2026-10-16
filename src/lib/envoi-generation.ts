import { erreursDepuisApi, type ErreursChamps } from "./erreurs-formulaire";
import type { Entrees } from "./recette";

export type ResultatEnvoi =
  | { type: "ok"; id: string }
  | { type: "champs"; erreur: string; champs: ErreursChamps }
  | { type: "erreur"; erreur: string; statut: number | null };

type CorpsReponse = {
  id?: string;
  erreur?: string;
  champs?: { champ: string; message: string }[];
};

const MESSAGES_PAR_DEFAUT: Record<number, string> = {
  401: "Ta session a expiré. Reconnecte-toi pour continuer.",
  403: "Cette action n'est pas autorisée.",
  429: "Tu as atteint ta limite de générations. Réessaie un peu plus tard.",
  503: "Le service de génération est momentanément indisponible. Réessaie dans un instant.",
};

export async function envoyerGeneration(entrees: Entrees): Promise<ResultatEnvoi> {
  let reponse: Response;
  try {
    reponse = await fetch("/api/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entrees),
    });
  } catch {
    return {
      type: "erreur",
      erreur: "Connexion impossible. Vérifie ton réseau et réessaie.",
      statut: null,
    };
  }

  const corps = (await reponse.json().catch(() => null)) as CorpsReponse | null;

  if (reponse.status === 202 && corps?.id) {
    return { type: "ok", id: corps.id };
  }

  if (reponse.status === 400 && corps?.champs) {
    return {
      type: "champs",
      erreur: corps.erreur ?? "Certains champs sont invalides.",
      champs: erreursDepuisApi(corps.champs),
    };
  }

  return {
    type: "erreur",
    erreur:
      corps?.erreur ??
      MESSAGES_PAR_DEFAUT[reponse.status] ??
      "Une erreur inattendue est survenue. Réessaie.",
    statut: reponse.status,
  };
}
