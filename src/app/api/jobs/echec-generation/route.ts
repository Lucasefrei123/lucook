import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { creerClientAdmin } from "@/lib/supabase/admin";

const rappelSchema = z.object({
  sourceBody: z.string(),
  status: z.number().optional(),
  retried: z.number().optional(),
});

const corpsOrigineSchema = z.object({ generationId: z.uuid() });

function lireCorpsOrigine(sourceBody: string): unknown {
  try {
    return JSON.parse(Buffer.from(sourceBody, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

async function traiter(request: Request) {
  const rappel = rappelSchema.safeParse(await request.json().catch(() => null));
  if (!rappel.success) {
    return NextResponse.json({ ignoree: "rappel invalide" });
  }

  const origine = corpsOrigineSchema.safeParse(lireCorpsOrigine(rappel.data.sourceBody));
  if (!origine.success) {
    return NextResponse.json({ ignoree: "corps d'origine invalide" });
  }

  console.error(
    `[Worker] Abandon de QStash pour ${origine.data.generationId} (statut ${rappel.data.status ?? "?"}, ${rappel.data.retried ?? "?"} nouvel(s) essai(s))`,
  );

  await creerClientAdmin()
    .from("generations")
    .update({
      statut: "erreur",
      message_erreur: "Le service de génération n'a pas pu traiter ta demande. Réessaie dans un instant.",
    })
    .eq("id", origine.data.generationId)
    .in("statut", ["en_attente", "en_cours"]);

  return NextResponse.json({ ok: true });
}

export const POST = verifySignatureAppRouter(traiter);
