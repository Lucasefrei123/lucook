import "server-only";
import { Resend } from "resend";

const DELAI_MS = 10_000;

export type ResultatEnvoiEmail = { ok: true; id: string } | { ok: false; erreur: string };

function lireConfiguration() {
  const cle = process.env.RESEND_API_KEY;
  const expediteur = process.env.EMAIL_EXPEDITEUR;
  if (!cle || !expediteur) return null;
  return { cle, expediteur };
}

export function emailsConfigures() {
  return lireConfiguration() !== null;
}

function avecDelai<T>(promesse: Promise<T>): Promise<T> {
  let minuteur: ReturnType<typeof setTimeout> | undefined;
  const expiration = new Promise<never>((_, rejeter) => {
    minuteur = setTimeout(() => rejeter(new Error(`Aucune réponse de Resend en ${DELAI_MS / 1000} s`)), DELAI_MS);
  });
  return Promise.race([promesse, expiration]).finally(() => clearTimeout(minuteur));
}

export async function envoyerEmail({
  destinataire,
  sujet,
  html,
  texte,
  cleIdempotence,
}: {
  destinataire: string;
  sujet: string;
  html: string;
  texte: string;
  cleIdempotence?: string;
}): Promise<ResultatEnvoiEmail> {
  const configuration = lireConfiguration();
  if (!configuration) return { ok: false, erreur: "RESEND_API_KEY ou EMAIL_EXPEDITEUR manquant" };

  try {
    const { data, error } = await avecDelai(
      new Resend(configuration.cle).emails.send(
        { from: configuration.expediteur, to: destinataire, subject: sujet, html, text: texte },
        cleIdempotence ? { idempotencyKey: cleIdempotence } : undefined,
      ),
    );
    if (error || !data) return { ok: false, erreur: error?.message ?? "Réponse vide de Resend" };
    return { ok: true, id: data.id };
  } catch (erreur) {
    return { ok: false, erreur: erreur instanceof Error ? erreur.message : "Erreur inconnue" };
  }
}

export async function verifierResend(): Promise<{ degrade?: boolean; detail?: string }> {
  const configuration = lireConfiguration();
  if (!configuration) throw new Error("RESEND_API_KEY ou EMAIL_EXPEDITEUR manquant");

  const { error } = await avecDelai(new Resend(configuration.cle).domains.list());
  if (error && error.name !== "restricted_api_key") throw new Error(error.message);
  return { detail: `Expéditeur : ${configuration.expediteur}` };
}
