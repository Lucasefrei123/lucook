import "server-only";
import { z } from "zod";

const DELAI_MS = 60_000;

export class ErreurIA extends Error {
  readonly status: number;
  readonly passagere: boolean;

  constructor(message: string, status: number, passagere: boolean) {
    super(message);
    this.name = "ErreurIA";
    this.status = status;
    this.passagere = passagere;
  }
}

type PartieContenu =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export type MessageIA = {
  role: "system" | "user" | "assistant";
  content: string | PartieContenu[];
};

export type ResultatIA = {
  texte: string;
  tronque: boolean;
  usage: { entree: number; sortie: number };
};

const reponseApiSchema = z.object({
  choices: z
    .array(
      z.object({
        message: z.object({ content: z.string().nullable() }),
        finish_reason: z.string().nullable().optional(),
      }),
    )
    .min(1),
  usage: z
    .object({ prompt_tokens: z.number(), completion_tokens: z.number() })
    .optional(),
});

function lireConfiguration() {
  const baseUrl = process.env.AI_BASE_URL;
  const cle = process.env.AI_API_KEY;
  const modele = process.env.AI_MODEL;
  if (!baseUrl || !cle || !modele) {
    throw new ErreurIA("Configuration du modèle incomplète.", 500, false);
  }
  return { baseUrl: baseUrl.replace(/\/$/, ""), cle, modele };
}

function messagePourStatut(status: number): string {
  if (status === 429) return "Le modèle est très sollicité, réessaie dans un instant.";
  if (status === 401 || status === 403) return "Accès au modèle refusé (clé API invalide).";
  if (status >= 500) return "Le modèle est momentanément indisponible.";
  return "La requête envoyée au modèle est invalide.";
}

export async function appelerIA(
  messages: MessageIA[],
  options: { maxTokens?: number } = {},
): Promise<ResultatIA> {
  const { baseUrl, cle, modele } = lireConfiguration();

  let reponse: Response;
  try {
    reponse = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cle}`,
      },
      body: JSON.stringify({
        model: modele,
        messages,
        max_tokens: options.maxTokens ?? 8000,
      }),
      signal: AbortSignal.timeout(DELAI_MS),
    });
  } catch (erreur) {
    const estTimeout = erreur instanceof DOMException && erreur.name === "TimeoutError";
    throw new ErreurIA(
      estTimeout ? "Le modèle a mis trop de temps à répondre." : "Impossible de joindre le modèle.",
      estTimeout ? 504 : 503,
      true,
    );
  }

  if (!reponse.ok) {
    const detail = await reponse.text().catch(() => "");
    console.error("[IA] Erreur HTTP", reponse.status, detail.slice(0, 500));
    const passagere = reponse.status === 429 || reponse.status >= 500;
    throw new ErreurIA(messagePourStatut(reponse.status), reponse.status, passagere);
  }

  const analyse = reponseApiSchema.safeParse(await reponse.json().catch(() => null));
  if (!analyse.success) {
    throw new ErreurIA("Réponse du modèle illisible.", 502, true);
  }

  const choix = analyse.data.choices[0];
  return {
    texte: choix.message.content ?? "",
    tronque: choix.finish_reason === "length",
    usage: {
      entree: analyse.data.usage?.prompt_tokens ?? 0,
      sortie: analyse.data.usage?.completion_tokens ?? 0,
    },
  };
}
