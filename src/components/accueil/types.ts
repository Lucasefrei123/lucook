import type { Budget, Difficulte, Objectif } from "@/lib/modes";

export type ValeursFrigo = {
  ingredients: string;
  photo: File | null;
};

export type ValeursEnvie = {
  envie: string;
  tempsMax: string;
  budget: Budget | null;
  difficulte: Difficulte | null;
};

export type ValeursSport = {
  objectif: Objectif | null;
  kcal: string;
  proteines: string;
  glucides: string;
  lipides: string;
  precisions: string;
};

export function idChamp(chemin: string) {
  return `champ-${chemin.replaceAll(".", "-")}`;
}
