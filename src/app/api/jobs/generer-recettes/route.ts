import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { emailsConfigures, envoyerEmail } from "@/lib/emails";
import { gabaritRecettesPretes } from "@/lib/gabarits-emails";
import { genererRecettes, type PhotoIA } from "@/lib/generer-recettes";
import { ErreurIA } from "@/lib/ia";
import { NOMBRE_REESSAIS } from "@/lib/qstash";
import { entreesSchema } from "@/lib/recette";
import { creerClientAdmin } from "@/lib/supabase/admin";

export const maxDuration = 120;

const corpsSchema = z.object({ generationId: z.uuid() });

type ClientAdmin = ReturnType<typeof creerClientAdmin>;

async function marquerErreur(supabase: ClientAdmin, id: string, message: string) {
  await supabase
    .from("generations")
    .update({ statut: "erreur", message_erreur: message })
    .eq("id", id);
}

async function notifierRecettesPretes(
  supabase: ClientAdmin,
  userId: string,
  generationId: string,
  recettes: { id: string; titre: string }[],
) {
  try {
    if (!emailsConfigures()) return;
    const { data } = await supabase.auth.admin.getUserById(userId);
    const destinataire = data.user?.email;
    if (!destinataire) return;

    const { sujet, html, texte } = gabaritRecettesPretes(
      generationId,
      recettes.map((recette) => recette.titre),
    );
    const envoi = await envoyerEmail({
      destinataire,
      sujet,
      html,
      texte,
      cleIdempotence: `recettes-pretes-${generationId}`,
    });

    await supabase.from("envois_email").insert({
      user_id: userId,
      recette_ids: recettes.map((recette) => recette.id),
      statut: envoi.ok ? "envoye" : "echec",
      erreur: envoi.ok ? null : envoi.erreur.slice(0, 500),
    });
    if (!envoi.ok) console.error("[E-mail] Notification non envoyée", envoi.erreur);
  } catch (erreur) {
    console.error("[E-mail] Notification impossible", erreur);
  }
}

async function chargerPhoto(supabase: ClientAdmin, chemin: string): Promise<PhotoIA | null> {
  const { data, error } = await supabase.storage.from("photos-frigo").download(chemin);
  if (error || !data) return null;
  const base64 = Buffer.from(await data.arrayBuffer()).toString("base64");
  return { typeMime: data.type || "image/jpeg", base64 };
}

async function traiter(request: Request) {
  const corps = corpsSchema.safeParse(await request.json().catch(() => null));
  if (!corps.success) {
    return NextResponse.json({ ignoree: "corps invalide" });
  }

  const { generationId } = corps.data;
  const tentative = Number(request.headers.get("Upstash-Retried") ?? 0);
  const dernierEssai = tentative >= NOMBRE_REESSAIS;
  const supabase = creerClientAdmin();

  const { data: generation } = await supabase
    .from("generations")
    .update({ statut: "en_cours", tentatives: tentative + 1 })
    .eq("id", generationId)
    .in("statut", ["en_attente", "en_cours"])
    .select("id, user_id, entrees, chemin_photo")
    .maybeSingle();

  if (!generation) {
    return NextResponse.json({ ignoree: "génération introuvable ou déjà traitée" });
  }

  const entrees = entreesSchema.safeParse(generation.entrees);
  if (!entrees.success) {
    await marquerErreur(supabase, generationId, "Ta demande est invalide.");
    return NextResponse.json({ ignoree: "entrées invalides" });
  }

  let photo: PhotoIA | undefined;
  if (generation.chemin_photo) {
    const chargee = await chargerPhoto(supabase, generation.chemin_photo);
    if (!chargee) {
      await marquerErreur(supabase, generationId, "La photo de ton frigo est introuvable.");
      return NextResponse.json({ ignoree: "photo introuvable" });
    }
    photo = chargee;
  }

  try {
    const { data: profil } = await supabase
      .from("profils")
      .select("regime, ingredients_a_eviter")
      .eq("user_id", generation.user_id)
      .maybeSingle();

    const resultat = await genererRecettes(
      entrees.data,
      {
        regime: profil?.regime ?? null,
        ingredientsAEviter: profil?.ingredients_a_eviter ?? [],
      },
      photo,
    );

    await supabase.from("recettes").delete().eq("generation_id", generationId);

    const { data: inserees, error: erreurInsertion } = await supabase
      .from("recettes")
      .insert(
        resultat.recettes.map((recette) => ({
          ...recette,
          user_id: generation.user_id,
          generation_id: generationId,
        })),
      )
      .select("id, titre");
    if (erreurInsertion) throw erreurInsertion;

    await supabase
      .from("generations")
      .update({ statut: "terminee", message_erreur: null })
      .eq("id", generationId);

    await notifierRecettesPretes(supabase, generation.user_id, generationId, inserees ?? []);

    return NextResponse.json({ ok: true, essaisIA: resultat.essais });
  } catch (erreur) {
    const passagere = erreur instanceof ErreurIA ? erreur.passagere : true;
    console.error(`[Worker] Échec (tentative ${tentative + 1})`, erreur);

    if (passagere && !dernierEssai) {
      await supabase
        .from("generations")
        .update({ statut: "en_attente" })
        .eq("id", generationId);
      return NextResponse.json({ erreur: "échec passager, nouvel essai" }, { status: 500 });
    }

    const message =
      erreur instanceof ErreurIA
        ? erreur.message
        : "Une erreur inattendue est survenue. Réessaie dans un instant.";
    await marquerErreur(supabase, generationId, message);
    return NextResponse.json({ ignoree: "échec définitif" });
  }
}

export const POST = verifySignatureAppRouter(traiter);