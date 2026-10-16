"use client";

import { motion, useReducedMotion } from "framer-motion";

import { TexteEnBoucle, useBoucle } from "@/components/ui/skiper-ui/skiper62";
import { STYLES_MODE } from "@/lib/modes";
import type { Mode } from "@/lib/recette";
import { cn } from "@/lib/utils";

const PHRASES = [
  "On lit ta commande attentivement…",
  "On ouvre le frigo et on fait l'inventaire…",
  "On aiguise les couteaux…",
  "Le riz est rincé trois fois…",
  "On goûte, on rectifie l'assaisonnement…",
  "Le dashi infuse doucement…",
  "On dresse chaque compartiment…",
  "On vérifie les temps de cuisson…",
] as const;

const COMPARTIMENTS = [
  { classe: "col-span-2 row-span-2", delai: 0 },
  { classe: "", delai: 0.6 },
  { classe: "", delai: 1.2 },
] as const;

export function AttentePreparation({ mode, enCours }: { mode: Mode; enCours: boolean }) {
  const reduit = useReducedMotion();
  const secondes = useBoucle(1000);
  const style = STYLES_MODE[mode];

  return (
    <div className="grid gap-px border border-cloison bg-cloison md:grid-cols-[1fr_1.2fr]">
      <div className="flex items-center justify-center bg-card p-8 md:p-12">
        <div
          aria-hidden="true"
          className="grid aspect-[4/3] w-full max-w-72 grid-cols-3 grid-rows-2 gap-1.5 rounded-[3px] border-4 border-bois-fonce bg-bois-fonce p-1.5"
        >
          {COMPARTIMENTS.map((compartiment, index) => (
            <div key={index} className={cn("relative overflow-hidden bg-background", compartiment.classe)}>
              <motion.div
                className={cn("absolute inset-0 origin-bottom", style.plein)}
                initial={{ scaleY: reduit ? 0.6 : 0 }}
                animate={
                  reduit
                    ? { scaleY: 0.6 }
                    : { scaleY: [0, 1, 1, 0], opacity: [0.9, 0.9, 0.9, 0] }
                }
                transition={
                  reduit
                    ? { duration: 0 }
                    : {
                        duration: 3.6,
                        times: [0, 0.35, 0.85, 1],
                        ease: "easeInOut",
                        repeat: Infinity,
                        delay: compartiment.delai,
                      }
                }
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col justify-center gap-4 bg-card p-6 md:p-10">
        <p className="flex items-center gap-2 font-mono text-xs tracking-widest text-muted-foreground uppercase">
          <span className={cn("size-2 rounded-full", style.plein)} aria-hidden="true" />
          {enCours ? "En préparation" : "En file d'attente"}
          <span className="ml-auto tabular-nums">{secondes} s</span>
        </p>
        <h2 className="text-2xl md:text-3xl">
          {enCours ? "Tes recettes mijotent." : "Ta commande est transmise en cuisine."}
        </h2>
        <TexteEnBoucle phrases={PHRASES} className="h-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Cela prend généralement moins d&apos;une minute. Tu peux quitter cette page : tes recettes
          t&apos;attendront dans <span className="text-foreground">Mes recettes</span>.
        </p>
      </div>
    </div>
  );
}
