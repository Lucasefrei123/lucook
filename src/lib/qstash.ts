import "server-only";
import { Client } from "@upstash/qstash";

export const NOMBRE_REESSAIS = Number(process.env.NOMBRE_REESSAIS) || 3;

export async function publierGeneration(generationId: string): Promise<void> {
  const token = process.env.QSTASH_TOKEN;
  const appUrl = process.env.APP_URL;
  if (!token || !appUrl) {
    throw new Error("Configuration QStash incomplète (QSTASH_TOKEN ou APP_URL).");
  }

  const client = new Client({ token, baseUrl: process.env.QSTASH_URL });

  await client.publishJSON({
    url: `${appUrl.replace(/\/$/, "")}/api/jobs/generer-recettes`,
    body: { generationId },
    retries: NOMBRE_REESSAIS,
    deduplicationId: generationId,
  });
}