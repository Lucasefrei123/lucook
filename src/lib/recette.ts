import { z } from "zod";

export const LIMITES = {
  recettesParGeneration: 3,
  longueurTexteMax: 500,
  taillePhotoMax: 5 * 1024 * 1024,
  typesPhoto: ["image/jpeg", "image/png", "image/webp"],
  quotaParHeure: 5,
} as const;

export const MODES = ["frigo", "envie", "sport"] as const;
export type Mode = (typeof MODES)[number];

export const STATUTS = ["en_attente", "en_cours", "terminee", "erreur"] as const;
export type StatutGeneration = (typeof STATUTS)[number];

export const RAYONS = [
  "fruits_legumes",
  "boucherie_poissonnerie",
  "cremerie",
  "epicerie",
  "surgeles",
  "boulangerie",
  "boissons",
  "autre",
] as const;

const ingredientSchema = z.object({
  nom: z.string().min(1).max(100),
  quantite: z.number().positive().nullable(),
  unite: z.string().max(20).nullable(),
  rayon: z.enum(RAYONS),
  manquant: z.boolean(),
});

const macrosSchema = z.object({
  kcal: z.number().nonnegative(),
  proteines: z.number().nonnegative(),
  glucides: z.number().nonnegative(),
  lipides: z.number().nonnegative(),
});

export const recetteSchema = z.object({
  titre: z.string().min(1).max(120),
  description: z.string().max(400),
  temps_minutes: z.number().int().positive().max(600),
  difficulte: z.enum(["facile", "moyen", "difficile"]),
  portions: z.number().int().positive().max(20),
  ingredients: z.array(ingredientSchema).min(1).max(40),
  etapes: z.array(z.string().min(1).max(600)).min(1).max(30),
  macros: macrosSchema.nullable(),
  tags: z.array(z.string().max(30)).max(8),
});

export const reponseIASchema = z.object({
  recettes: z.array(recetteSchema).length(LIMITES.recettesParGeneration),
});

export type Recette = z.infer<typeof recetteSchema>;

const entreesFrigoSchema = z.object({
  mode: z.literal("frigo"),
  ingredients: z.string().trim().max(LIMITES.longueurTexteMax),
  cheminPhoto: z.string().max(200).nullable(),
});

const entreesEnvieSchema = z.object({
  mode: z.literal("envie"),
  envie: z.string().trim().min(3, "Décris un peu plus ton envie.").max(LIMITES.longueurTexteMax),
  tempsMax: z.number().int().min(5).max(240).nullable(),
  budget: z.enum(["petit", "moyen", "large"]).nullable(),
  difficulte: z.enum(["facile", "moyen", "difficile"]).nullable(),
});

const entreesSportSchema = z.object({
  mode: z.literal("sport"),
  objectif: z.enum(["prise_de_masse", "seche", "maintien"]).nullable(),
  cibles: z
    .object({
      kcal: z.number().int().min(100).max(3000).nullable(),
      proteines: z.number().int().min(0).max(300).nullable(),
      glucides: z.number().int().min(0).max(500).nullable(),
      lipides: z.number().int().min(0).max(200).nullable(),
    })
    .nullable(),
  precisions: z.string().trim().max(300),
});

export const entreesSchema = z
  .discriminatedUnion("mode", [entreesFrigoSchema, entreesEnvieSchema, entreesSportSchema])
  .superRefine((entrees, ctx) => {
    if (entrees.mode === "frigo" && !entrees.ingredients && !entrees.cheminPhoto) {
      ctx.addIssue({
        code: "custom",
        message: "Indique tes ingrédients ou ajoute une photo de ton frigo.",
        path: ["ingredients"],
      });
    }
    if (entrees.mode === "sport" && !entrees.objectif && !entrees.cibles) {
      ctx.addIssue({
        code: "custom",
        message: "Choisis un objectif ou indique tes apports cibles.",
        path: ["objectif"],
      });
    }
  });

export type Entrees = z.infer<typeof entreesSchema>;

export type Preferences = {
  regime: string | null;
  ingredientsAEviter: string[];
};

export type LigneGeneration = {
  id: string;
  mode: Mode;
  statut: StatutGeneration;
  message_erreur: string | null;
  entrees: unknown;
};

export type LigneRecette = Recette & {
  id: string;
  generation_id: string;
  favori: boolean;
  created_at: string;
};