import "server-only";
import { Client } from "@upstash/qstash";
import { Redis } from "@upstash/redis";
import { appelerIA } from "./ia";
import { executerControle, type Controle } from "./controles";
import { verifierResend } from "./emails";
import { creerClientAdmin } from "./supabase/admin";

function echec(erreur: { message: string } | null): void {
  if (erreur) throw new Error(erreur.message);
}

export const CONTROLES: Controle[] = [
  {
    service: "Base de données",
    description: "Supabase Postgres",
    verifier: async () => {
      const { count, error } = await creerClientAdmin()
        .from("profils")
        .select("*", { count: "exact", head: true });
      echec(error);
      return { detail: `${count ?? 0} profil(s)` };
    },
  },
  {
    service: "Authentification",
    description: "Supabase Auth",
    verifier: async () => {
      const { error } = await creerClientAdmin().auth.admin.listUsers({ page: 1, perPage: 1 });
      echec(error);
    },
  },
  {
    service: "Stockage",
    description: "Supabase Storage, bucket photos-frigo",
    verifier: async () => {
      const { data, error } = await creerClientAdmin().storage.getBucket("photos-frigo");
      echec(error);
      if (data?.public) return { degrade: true, detail: "Le bucket est public !" };
      return { detail: "Bucket privé" };
    },
  },
  {
    service: "Temps réel",
    description: "Supabase Realtime",
    verifier: async () => {
      const supabase = creerClientAdmin();
      const canal = supabase.channel(`controle-${crypto.randomUUID()}`);
      try {
        await new Promise<void>((resoudre, rejeter) => {
          canal.subscribe((statut, erreur) => {
            if (statut === "SUBSCRIBED") resoudre();
            if (statut === "CHANNEL_ERROR" || statut === "TIMED_OUT") {
              rejeter(erreur ?? new Error(`Canal : ${statut}`));
            }
          });
        });
      } finally {
        await supabase.removeChannel(canal);
      }
    },
  },
  {
    service: "Modèle IA",
    description: "API Claude (endpoint compatible chat/completions)",
    delaiMs: 15000,
    seuilLentMs: 8000,
    verifier: async () => {
      const resultat = await appelerIA(
        [{ role: "user", content: "Réponds uniquement par le mot : ok" }],
        { maxTokens: 64 },
      );
      if (!resultat.texte) return { degrade: true, detail: "Réponse vide" };
      return { detail: process.env.AI_MODEL };
    },
  },
  {
    service: "Quota",
    description: "Upstash Redis",
    verifier: async () => {
      const reponse = await Redis.fromEnv().ping();
      if (reponse !== "PONG") return { degrade: true, detail: `Réponse inattendue : ${reponse}` };
    },
  },
  {
    service: "File de tâches",
    description: "Upstash QStash",
    verifier: async () => {
      const token = process.env.QSTASH_TOKEN;
      if (!token) throw new Error("QSTASH_TOKEN manquant");
      await new Client({ token, baseUrl: process.env.QSTASH_URL }).schedules.list();
      if (!process.env.APP_URL) return { degrade: true, detail: "APP_URL manquante" };
      return { detail: `Worker : ${process.env.APP_URL}` };
    },
  },
  {
    service: "E-mails",
    description: "Resend",
    verifier: verifierResend,
  },
];

export function executerTousLesControles() {
  return Promise.all(CONTROLES.map(executerControle));
}