import { Dumbbell, Refrigerator, Sparkles, type LucideIcon } from "lucide-react";
import type { Mode } from "./recette";

export type StyleMode = {
  titre: string;
  description: string;
  icone: LucideIcon;
  plein: string;
  doux: string;
  texte: string;
  trait: string;
  bouton: string;
  repos: string;
  coche: string;
};

export const STYLES_MODE: Record<Mode, StyleMode> = {
  frigo: {
    titre: "Frigo",
    description: "Ce que tu as sous la main, en texte ou en photo.",
    icone: Refrigerator,
    plein: "bg-frigo text-frigo-contraste",
    doux: "bg-frigo-doux",
    texte: "text-frigo",
    trait: "border-frigo-trait",
    bouton: "bg-frigo text-frigo-contraste hover:bg-frigo/85",
    repos: "bg-card text-foreground hover:bg-frigo-doux",
    coche: "has-checked:bg-frigo has-checked:text-frigo-contraste",
  },
  envie: {
    titre: "Envie",
    description: "Une humeur, un plat, une saison : on cuisine ton envie.",
    icone: Sparkles,
    plein: "bg-envie text-envie-contraste",
    doux: "bg-envie-doux",
    texte: "text-envie",
    trait: "border-envie-trait",
    bouton: "bg-envie text-envie-contraste hover:bg-envie/85",
    repos: "bg-card text-foreground hover:bg-envie-doux",
    coche: "has-checked:bg-envie has-checked:text-envie-contraste",
  },
  sport: {
    titre: "Sport",
    description: "Des assiettes calées sur ton objectif et tes macros.",
    icone: Dumbbell,
    plein: "bg-sport text-sport-contraste",
    doux: "bg-sport-doux",
    texte: "text-sport",
    trait: "border-sport-trait",
    bouton: "bg-sport text-sport-contraste hover:bg-sport/85",
    repos: "bg-card text-foreground hover:bg-sport-doux",
    coche: "has-checked:bg-sport has-checked:text-sport-contraste",
  },
};

export const OBJECTIFS = ["prise_de_masse", "seche", "maintien"] as const;
export type Objectif = (typeof OBJECTIFS)[number];

export const LIBELLES_OBJECTIF: Record<Objectif, string> = {
  prise_de_masse: "Prise de masse",
  seche: "Sèche",
  maintien: "Maintien",
};

export const DIFFICULTES = ["facile", "moyen", "difficile"] as const;
export type Difficulte = (typeof DIFFICULTES)[number];

export const LIBELLES_DIFFICULTE: Record<Difficulte, string> = {
  facile: "Facile",
  moyen: "Moyen",
  difficile: "Difficile",
};

export const BUDGETS = ["petit", "moyen", "large"] as const;
export type Budget = (typeof BUDGETS)[number];

export const LIBELLES_BUDGET: Record<Budget, string> = {
  petit: "Petit budget",
  moyen: "Budget moyen",
  large: "Sans compter",
};

export function formaterDuree(minutes: number | null | undefined) {
  if (!minutes) return "—";
  if (minutes < 60) return `${minutes} min`;
  const heures = Math.floor(minutes / 60);
  const reste = minutes % 60;
  return reste ? `${heures} h ${reste}` : `${heures} h`;
}
