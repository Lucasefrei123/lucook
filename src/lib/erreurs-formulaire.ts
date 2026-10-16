import type { z } from "zod";

export type ErreursChamps = Record<string, string>;

function messageIssue(issue: z.core.$ZodIssue) {
  if (issue.code === "too_small" && issue.origin === "number") {
    return `Minimum ${issue.minimum}.`;
  }
  if (issue.code === "too_big" && issue.origin === "number") {
    return `Maximum ${issue.maximum}.`;
  }
  if (issue.code === "too_big" && issue.origin === "string") {
    return `${issue.maximum} caractères maximum.`;
  }
  if (issue.code === "invalid_type") {
    return "Valeur invalide.";
  }
  return issue.message;
}

export function erreursDepuisZod(issues: readonly z.core.$ZodIssue[]): ErreursChamps {
  const erreurs: ErreursChamps = {};
  for (const issue of issues) {
    const champ = issue.path.join(".");
    if (!erreurs[champ]) erreurs[champ] = messageIssue(issue);
  }
  return erreurs;
}

export function erreursDepuisApi(champs: { champ: string; message: string }[]): ErreursChamps {
  const erreurs: ErreursChamps = {};
  for (const { champ, message } of champs) {
    if (!erreurs[champ]) erreurs[champ] = message;
  }
  return erreurs;
}
