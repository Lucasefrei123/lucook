"use client";

import { motion, useReducedMotion } from "framer-motion";

import { CarteRecette } from "@/components/recettes/carte-recette";
import type { LigneRecette, Mode } from "@/lib/recette";
import { cn } from "@/lib/utils";

const EMPLACEMENTS = [
  "md:col-span-2 md:row-span-2",
  "md:col-start-3 md:row-start-1",
  "md:col-start-3 md:row-start-2",
] as const;

export function BentoRecettes({ recettes, mode }: { recettes: LigneRecette[]; mode: Mode }) {
  const reduit = useReducedMotion();

  return (
    <ul className="grid gap-px border border-cloison bg-cloison md:grid-cols-3 md:grid-rows-2">
      {recettes.map((recette, index) => (
        <motion.li
          key={recette.id}
          className={cn("flex min-h-56", EMPLACEMENTS[index] ?? "")}
          initial={reduit ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
        >
          <CarteRecette
            recette={recette}
            mode={mode}
            numero={index + 1}
            grande={index === 0}
            className="w-full"
          />
        </motion.li>
      ))}
    </ul>
  );
}
