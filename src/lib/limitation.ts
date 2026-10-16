import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { LIMITES } from "./recette";

const QUOTA = Number(process.env.QUOTA_PAR_HEURE) || LIMITES.quotaParHeure;

export type ResultatQuota = {
  autorise: boolean;
  limite: number;
  restant: number;
  reinitialisation: number;
  degrade: boolean;
};

let limiteur: Ratelimit | null = null;

function obtenirLimiteur(): Ratelimit {
  if (!limiteur) {
    limiteur = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(QUOTA, "1 h"),
      prefix: "lucook:generations",
      timeout: 2000,
    });
  }
  return limiteur;
}

export async function verifierQuota(userId: string): Promise<ResultatQuota> {
  try {
    const resultat = await obtenirLimiteur().limit(userId);
    return {
      autorise: resultat.success,
      limite: resultat.limit,
      restant: resultat.remaining,
      reinitialisation: resultat.reset,
      degrade: false,
    };
  } catch (erreur) {
    console.error("[Quota] Redis indisponible, requête autorisée", erreur);
    return {
      autorise: true,
      limite: QUOTA,
      restant: QUOTA,
      reinitialisation: Date.now(),
      degrade: true,
    };
  }
}

export function entetesQuota(quota: ResultatQuota): Record<string, string> {
  const entetes: Record<string, string> = {
    "X-RateLimit-Limit": String(quota.limite),
    "X-RateLimit-Remaining": String(quota.restant),
    "X-RateLimit-Reset": String(Math.ceil(quota.reinitialisation / 1000)),
  };
  if (!quota.autorise) {
    entetes["Retry-After"] = String(
      Math.max(1, Math.ceil((quota.reinitialisation - Date.now()) / 1000)),
    );
  }
  return entetes;
}

export function formaterAttente(reinitialisation: number): string {
  const minutes = Math.max(1, Math.ceil((reinitialisation - Date.now()) / 60_000));
  return minutes >= 60 ? "1 h" : `${minutes} min`;
}