import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { emailsConfigures, envoyerEmail } from "@/lib/emails";
import { gabaritListeCourses } from "@/lib/gabarits-emails";
import { entetesQuota, formaterAttente, verifierQuotaEmails } from "@/lib/limitation";
import type { Mode, Recette } from "@/lib/recette";
import { creerClientServeur } from "@/lib/supabase/server";

const corpsSchema = z.object({
  recetteIds: z
    .array(z.uuid("Identifiant de recette invalide."))
    .min(1, "Sélectionne au moins une recette.")
    .max(10, "Tu peux envoyer 10 recettes au maximum à la fois."),
});

type LigneRecetteEmail = Pick<
  Recette,
  "titre" | "description" | "temps_minutes" | "portions" | "ingredients"
> & {
  id: string;
  generations: { mode: Mode } | { mode: Mode }[] | null;
};

export async function POST(request: NextRequest) {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erreur: "Tu dois être connecté." }, { status: 401 });
  }

  const analyse = corpsSchema.safeParse(await request.json().catch(() => null));
  if (!analyse.success) {
    return NextResponse.json(
      {
        erreur: analyse.error.issues[0]?.message ?? "Données invalides.",
        champs: analyse.error.issues.map((i) => ({ champ: i.path.join("."), message: i.message })),
      },
      { status: 400 },
    );
  }

  if (!user.email || !emailsConfigures()) {
    return NextResponse.json(
      { erreur: "L'envoi d'e-mails est momentanément indisponible." },
      { status: 503 },
    );
  }

  const quota = await verifierQuotaEmails(user.id);
  if (quota.degrade) {
    return NextResponse.json(
      { erreur: "L'envoi d'e-mails est momentanément indisponible. Réessaie dans un instant." },
      { status: 503 },
    );
  }
  if (!quota.autorise) {
    return NextResponse.json(
      {
        erreur: `Tu as atteint ta limite de ${quota.limite} e-mails par heure. Réessaie dans ${formaterAttente(quota.reinitialisation)}.`,
      },
      { status: 429, headers: entetesQuota(quota) },
    );
  }

  const recetteIds = [...new Set(analyse.data.recetteIds)];
  const { data, error } = await supabase
    .from("recettes")
    .select("id, titre, description, temps_minutes, portions, ingredients, generations(mode)")
    .in("id", recetteIds);

  if (error) {
    console.error("[E-mail] Lecture des recettes impossible", error);
    return NextResponse.json({ erreur: "Impossible de préparer ton e-mail. Réessaie." }, { status: 500 });
  }

  const lignes = (data ?? []) as unknown as LigneRecetteEmail[];
  if (lignes.length !== recetteIds.length) {
    return NextResponse.json({ erreur: "Certaines recettes sont introuvables." }, { status: 404 });
  }

  const ordre = new Map(recetteIds.map((id, index) => [id, index]));
  const recettes = lignes
    .map(({ generations, ...recette }) => ({
      ...recette,
      mode: (Array.isArray(generations) ? generations[0]?.mode : generations?.mode) ?? null,
    }))
    .sort((a, b) => (ordre.get(a.id) ?? 0) - (ordre.get(b.id) ?? 0));

  const { sujet, html, texte } = gabaritListeCourses(recettes);
  const envoi = await envoyerEmail({ destinataire: user.email, sujet, html, texte });

  const { error: erreurJournal } = await supabase.from("envois_email").insert({
    user_id: user.id,
    recette_ids: recetteIds,
    statut: envoi.ok ? "envoye" : "echec",
    erreur: envoi.ok ? null : envoi.erreur.slice(0, 500),
  });
  if (erreurJournal) console.error("[E-mail] Journalisation impossible", erreurJournal);

  if (!envoi.ok) {
    console.error("[E-mail] Envoi de la liste de courses impossible", envoi.erreur);
    if (envoi.destinataireNonAutorise) {
      return NextResponse.json(
        { erreur: "L'envoi d'e-mails est limité au compte de démonstration pour le moment." },
        { status: 403 },
      );
    }
    return NextResponse.json(
      { erreur: "L'e-mail n'a pas pu être envoyé. Réessaie dans un instant." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, destinataire: user.email }, { headers: entetesQuota(quota) });
}
