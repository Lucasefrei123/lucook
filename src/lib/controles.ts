import "server-only";

export type EtatService = "operationnel" | "degrade" | "en_panne";

export type RetourControle = { degrade?: boolean; detail?: string } | void;

export type Controle = {
  service: string;
  description: string;
  delaiMs?: number;
  seuilLentMs?: number;
  verifier: () => Promise<RetourControle>;
};

export type ResultatControle = {
  service: string;
  description: string;
  etat: EtatService;
  latenceMs: number;
  detail: string | null;
};

export async function executerControle(controle: Controle): Promise<ResultatControle> {
  const delaiMs = controle.delaiMs ?? 5000;
  const seuilLentMs = controle.seuilLentMs ?? 2000;
  const debut = performance.now();
  let minuteur: ReturnType<typeof setTimeout> | undefined;

  try {
    const expiration = new Promise<never>((_, rejeter) => {
      minuteur = setTimeout(
        () => rejeter(new Error(`Aucune réponse en ${delaiMs / 1000} s`)),
        delaiMs,
      );
    });

    const retour = await Promise.race([controle.verifier(), expiration]);
    const latenceMs = Math.round(performance.now() - debut);
    const lent = latenceMs > seuilLentMs;

    return {
      service: controle.service,
      description: controle.description,
      etat: retour?.degrade || lent ? "degrade" : "operationnel",
      latenceMs,
      detail: retour?.detail ?? (lent ? "Réponse lente" : null),
    };
  } catch (erreur) {
    return {
      service: controle.service,
      description: controle.description,
      etat: "en_panne",
      latenceMs: Math.round(performance.now() - debut),
      detail: erreur instanceof Error ? erreur.message : "Erreur inconnue",
    };
  } finally {
    clearTimeout(minuteur);
  }
}

export function etatGlobal(resultats: ResultatControle[]): EtatService {
  if (resultats.some((r) => r.etat === "en_panne")) return "en_panne";
  if (resultats.some((r) => r.etat === "degrade")) return "degrade";
  return "operationnel";
}