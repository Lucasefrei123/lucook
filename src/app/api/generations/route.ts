import { NextResponse, type NextRequest } from "next/server";
import { entetesQuota, formaterAttente, verifierQuota } from "@/lib/limitation";
import { publierGeneration } from "@/lib/qstash";
import { entreesSchema } from "@/lib/recette";
import { creerClientAdmin } from "@/lib/supabase/admin";
import { creerClientServeur } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erreur: "Tu dois être connecté." }, { status: 401 });
  }

  const analyse = entreesSchema.safeParse(await request.json().catch(() => null));
  if (!analyse.success) {
    return NextResponse.json(
      {
        erreur: analyse.error.issues[0]?.message ?? "Données invalides.",
        champs: analyse.error.issues.map((i) => ({ champ: i.path.join("."), message: i.message })),
      },
      { status: 400 },
    );
  }

  const entrees = analyse.data;
  const cheminPhoto = entrees.mode === "frigo" ? entrees.cheminPhoto : null;

  if (cheminPhoto && !cheminPhoto.startsWith(`${user.id}/`)) {
    return NextResponse.json({ erreur: "Photo non autorisée." }, { status: 403 });
  }

  const quota = await verifierQuota(user.id);
  if (!quota.autorise) {
    return NextResponse.json(
      {
        erreur: `Tu as atteint ta limite de ${quota.limite} générations par heure. Réessaie dans ${formaterAttente(quota.reinitialisation)}.`,
      },
      { status: 429, headers: entetesQuota(quota) },
    );
  }

  const { data: generation, error } = await supabase
    .from("generations")
    .insert({
      user_id: user.id,
      mode: entrees.mode,
      entrees,
      chemin_photo: cheminPhoto,
    })
    .select("id")
    .single();

  if (error || !generation) {
    console.error("[Generations] Insertion impossible", error);
    return NextResponse.json(
      { erreur: "Impossible d'enregistrer ta demande. Réessaie." },
      { status: 500 },
    );
  }

  try {
    await publierGeneration(generation.id);
  } catch (erreur) {
    console.error("[Generations] Publication QStash impossible", erreur);
    await creerClientAdmin()
      .from("generations")
      .update({ statut: "erreur", message_erreur: "Le service de génération est indisponible." })
      .eq("id", generation.id);
    return NextResponse.json(
      { erreur: "Le service de génération est momentanément indisponible. Réessaie dans un instant." },
      { status: 503 },
    );
  }

  return NextResponse.json({ id: generation.id }, { status: 202, headers: entetesQuota(quota) });
}