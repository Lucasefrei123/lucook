import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { LIMITES } from "./recette";

const QUOTA_GENERATIONS = Number(process.env.QUOTA_PAR_HEURE) || LIMITES.quotaParHeure;
const QUOTA_EMAILS = 5;

export type ResultatQuota = {
  autorise: boolean;
  limite: number;
  restant: number;
  reinitialisation: number;
  degrade: boolean;
};

const limiteurs = new Map<string, Ratelimit>();

function obtenirLimiteur(prefixe: string, quota: number): Ratelimit {
  let limiteur = limiteurs.get(prefixe);
  if (!limiteur) {
    limiteur = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(quota, "1 h"),
      prefix: prefixe,
      timeout: 2000,
    });
    limiteurs.set(prefixe, limiteur);
  }
  return limiteur;
}

async function verifier(prefixe: string, quota: number, userId: string): Promise<ResultatQuota> {
  try {
    const resultat = await obtenirLimiteur(prefixe, quota).limit(userId);
    return {
      autorise: resultat.success,
      limite: resultat.limit,
      restant: resultat.remaining,
      reinitialisation: resultat.reset,
      degrade: false,
    };
  } catch (erreur) {
    console.error("[Quota] Redis indisponible, requête refusée", erreur);
    return {
      autorise: false,
      limite: quota,
      restant: 0,
      reinitialisation: Date.now(),
      degrade: true,
    };
  }
}

export function verifierQuota(userId: string): Promise<ResultatQuota> {
  return verifier("lucook:generations", QUOTA_GENERATIONS, userId);
}

export function verifierQuotaEmails(userId: string): Promise<ResultatQuota> {
  return verifier("lucook:emails", QUOTA_EMAILS, userId);
}

export function entetesQuota(quota: ResultatQuota): Record<string, string> {
  const entetes: Record<string, string> = {
    "X-RateLimit-Limit": String(quota.limite),
    "X-RateLimit-Remaining": String(quota.restant),
    "X-RateLimit-Reset": String(Math.ceil(quota.reinitialisation / 1000)),
  };
  if (!quota.autorise && !quota.degrade) {
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
