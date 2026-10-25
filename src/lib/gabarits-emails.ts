import "server-only";
import { RAYONS, type Mode, type Recette } from "./recette";

type RecetteEmail = Pick<Recette, "titre" | "description" | "temps_minutes" | "portions" | "ingredients"> & {
  id: string;
  mode: Mode | null;
};

type Rayon = (typeof RAYONS)[number];

type LigneCourses = { nom: string; quantite: number | null; unite: string | null };

const LIBELLES_RAYON: Record<Rayon, string> = {
  fruits_legumes: "Fruits et légumes",
  boucherie_poissonnerie: "Boucherie et poissonnerie",
  cremerie: "Crèmerie",
  epicerie: "Épicerie",
  surgeles: "Surgelés",
  boulangerie: "Boulangerie",
  boissons: "Boissons",
  autre: "Autre",
};

const COULEURS = {
  fond: "#F4EFE6",
  case: "#FBF8F2",
  cloison: "#D9C4A3",
  bois: "#6B4F36",
  encre: "#1F1D1A",
  vermillon: "#C8402F",
};

function echapper(texte: string) {
  return texte
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function lienApp(chemin: string) {
  const base = process.env.APP_URL?.replace(/\/$/, "");
  return base ? `${base}${chemin}` : null;
}

function formaterQuantite(ligne: LigneCourses) {
  if (ligne.quantite === null) return ligne.unite ?? "";
  const nombre = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(ligne.quantite);
  return ligne.unite ? `${nombre} ${ligne.unite}` : nombre;
}

export function construireListeCourses(recettes: RecetteEmail[]) {
  const parRayon = new Map<Rayon, Map<string, LigneCourses>>();

  for (const recette of recettes) {
    for (const ingredient of recette.ingredients) {
      if (recette.mode === "frigo" && !ingredient.manquant) continue;

      const rayon = parRayon.get(ingredient.rayon) ?? new Map<string, LigneCourses>();
      parRayon.set(ingredient.rayon, rayon);

      const cle = `${ingredient.nom.trim().toLowerCase()}|${ingredient.unite ?? ""}`;
      const existante = rayon.get(cle);
      if (!existante) {
        rayon.set(cle, { nom: ingredient.nom.trim(), quantite: ingredient.quantite, unite: ingredient.unite });
      } else if (ingredient.quantite !== null) {
        existante.quantite = (existante.quantite ?? 0) + ingredient.quantite;
      }
    }
  }

  return RAYONS.filter((rayon) => parRayon.has(rayon)).map((rayon) => ({
    rayon,
    libelle: LIBELLES_RAYON[rayon],
    lignes: [...parRayon.get(rayon)!.values()].sort((a, b) => a.nom.localeCompare(b.nom, "fr")),
  }));
}

function enveloppe(titre: string, contenu: string) {
  return `<!doctype html>
<html lang="fr">
<body style="margin:0;padding:24px 12px;background:${COULEURS.fond};font-family:'Helvetica Neue',Arial,sans-serif;color:${COULEURS.encre};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:${COULEURS.cloison};">
<tr><td style="padding:1px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COULEURS.case};">
<tr><td style="padding:24px 24px 8px;">
<span style="display:inline-block;background:${COULEURS.vermillon};color:${COULEURS.case};font-size:18px;line-height:32px;width:32px;text-align:center;">食</span>
<span style="font-family:Georgia,serif;font-size:20px;margin-left:8px;vertical-align:middle;">Lucook</span>
<h1 style="font-family:Georgia,serif;font-weight:normal;font-size:24px;margin:20px 0 0;">${echapper(titre)}</h1>
</td></tr>
${contenu}
<tr><td style="padding:16px 24px 24px;font-size:12px;color:${COULEURS.bois};">Recettes composées par IA, à vérifier avant de cuisiner.</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function bouton(lien: string | null, libelle: string) {
  if (!lien) return "";
  return `<tr><td style="padding:8px 24px 16px;"><a href="${echapper(lien)}" style="display:inline-block;background:${COULEURS.vermillon};color:${COULEURS.case};text-decoration:none;padding:12px 20px;font-size:14px;">${echapper(libelle)}</a></td></tr>`;
}

export function gabaritListeCourses(recettes: RecetteEmail[]) {
  const liste = construireListeCourses(recettes);
  const sujet =
    recettes.length > 1
      ? `Ta liste de courses pour ${recettes.length} recettes`
      : `Ta liste de courses : ${recettes[0].titre}`;

  const blocRecettes = recettes
    .map((recette) => {
      const lien = lienApp(`/recettes/${recette.id}`);
      const titre = lien
        ? `<a href="${echapper(lien)}" style="color:${COULEURS.encre};">${echapper(recette.titre)}</a>`
        : echapper(recette.titre);
      return `<tr><td style="padding:12px 24px;border-top:1px solid ${COULEURS.cloison};">
<p style="margin:0;font-family:Georgia,serif;font-size:17px;">${titre}</p>
<p style="margin:4px 0 0;font-size:12px;color:${COULEURS.bois};">${recette.temps_minutes} min · ${recette.portions} portion${recette.portions > 1 ? "s" : ""}</p>
${recette.description ? `<p style="margin:6px 0 0;font-size:14px;">${echapper(recette.description)}</p>` : ""}
</td></tr>`;
    })
    .join("");

  const blocCourses = liste.length
    ? liste
        .map(
          (groupe) => `<tr><td style="padding:12px 24px 4px;">
<p style="margin:0 0 6px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${COULEURS.bois};">${echapper(groupe.libelle)}</p>
${groupe.lignes
  .map(
    (ligne) =>
      `<p style="margin:0;padding:6px 0;border-bottom:1px solid ${COULEURS.cloison};font-size:14px;">☐ ${echapper(ligne.nom)}<span style="float:right;font-family:monospace;color:${COULEURS.bois};">${echapper(formaterQuantite(ligne))}</span></p>`,
  )
  .join("")}
</td></tr>`,
        )
        .join("")
    : `<tr><td style="padding:12px 24px;font-size:14px;">Tu as déjà tout ce qu'il faut : rien à acheter.</td></tr>`;

  const html = enveloppe(
    "Ton résumé et ta liste de courses",
    `<tr><td style="padding:16px 24px 4px;"><h2 style="font-family:Georgia,serif;font-weight:normal;font-size:18px;margin:0;">Au menu</h2></td></tr>
${blocRecettes}
<tr><td style="padding:20px 24px 4px;"><h2 style="font-family:Georgia,serif;font-weight:normal;font-size:18px;margin:0;">Liste de courses</h2></td></tr>
${blocCourses}
${bouton(lienApp("/recettes"), "Ouvrir mes recettes")}`,
  );

  const texte = [
    "Ton résumé et ta liste de courses — Lucook",
    "",
    "AU MENU",
    ...recettes.map((r) => `- ${r.titre} (${r.temps_minutes} min, ${r.portions} portion(s))`),
    "",
    "LISTE DE COURSES",
    ...(liste.length
      ? liste.flatMap((groupe) => [
          "",
          groupe.libelle.toUpperCase(),
          ...groupe.lignes.map((ligne) => `[ ] ${ligne.nom} ${formaterQuantite(ligne)}`.trim()),
        ])
      : ["Rien à acheter."]),
  ].join("\n");

  return { sujet, html, texte };
}

export function gabaritRecettesPretes(generationId: string, titres: string[]) {
  const lien = lienApp(`/generations/${generationId}`);
  const html = enveloppe(
    "Tes recettes sont prêtes",
    `<tr><td style="padding:16px 24px 4px;font-size:14px;">Lucook a composé ${titres.length} recettes pour toi :</td></tr>
${titres
  .map(
    (titre, index) =>
      `<tr><td style="padding:8px 24px;font-family:Georgia,serif;font-size:17px;border-top:1px solid ${COULEURS.cloison};"><span style="font-family:monospace;font-size:12px;color:${COULEURS.bois};">0${index + 1}</span> ${echapper(titre)}</td></tr>`,
  )
  .join("")}
${bouton(lien, "Voir mes recettes")}`,
  );
  const texte = [
    "Tes recettes sont prêtes — Lucook",
    "",
    ...titres.map((titre, index) => `0${index + 1}. ${titre}`),
    ...(lien ? ["", lien] : []),
  ].join("\n");

  return { sujet: "Tes recettes Lucook sont prêtes", html, texte };
}
