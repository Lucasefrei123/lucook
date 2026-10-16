"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type Panneau<Cle extends string> = {
  cle: Cle;
  titre: string;
  description: string;
  icone: ReactNode;
  classeActive: string;
  classeRepos: string;
};

export function PanneauxExtensibles<Cle extends string>({
  panneaux,
  valeur,
  surChangement,
  libelle,
  className,
}: {
  panneaux: readonly Panneau<Cle>[];
  valeur: Cle;
  surChangement: (cle: Cle) => void;
  libelle: string;
  className?: string;
}) {
  const reduit = useReducedMotion();
  const [survole, setSurvole] = useState<Cle | null>(null);
  const boutons = useRef<(HTMLButtonElement | null)[]>([]);
  const ouvert = survole ?? valeur;

  function naviguer(evenement: KeyboardEvent<HTMLButtonElement>, index: number) {
    const pas =
      evenement.key === "ArrowRight" || evenement.key === "ArrowDown"
        ? 1
        : evenement.key === "ArrowLeft" || evenement.key === "ArrowUp"
          ? -1
          : 0;
    if (!pas) return;
    evenement.preventDefault();
    const suivant = (index + pas + panneaux.length) % panneaux.length;
    surChangement(panneaux[suivant].cle);
    boutons.current[suivant]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label={libelle}
      onMouseLeave={() => setSurvole(null)}
      className={cn("flex w-full flex-col gap-px bg-cloison md:h-56 md:flex-row", className)}
    >
      {panneaux.map((panneau, index) => {
        const actif = panneau.cle === valeur;
        const deplie = panneau.cle === ouvert;
        return (
          <motion.button
            key={panneau.cle}
            ref={(element) => {
              boutons.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={actif}
            tabIndex={actif ? 0 : -1}
            onClick={() => surChangement(panneau.cle)}
            onKeyDown={(evenement) => naviguer(evenement, index)}
            onHoverStart={() => setSurvole(panneau.cle)}
            animate={{ flexGrow: deplie ? 3 : 1 }}
            transition={{ duration: reduit ? 0 : 0.3, ease: "easeInOut" }}
            className={cn(
              "relative flex min-h-20 basis-0 cursor-pointer flex-col items-start justify-between gap-3 overflow-hidden p-4 text-left outline-none transition-colors focus-visible:z-10 focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:ring-inset md:min-w-0 md:p-5",
              actif ? panneau.classeActive : panneau.classeRepos,
            )}
          >
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="[&_svg]:size-5">
                {panneau.icone}
              </span>
              <span className="font-heading text-xl whitespace-nowrap">{panneau.titre}</span>
            </span>
            <span className="text-sm leading-snug md:hidden">{panneau.description}</span>
            <AnimatePresence initial={false}>
              {deplie && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduit ? 0 : 0.2 }}
                  className="hidden max-w-xs text-sm leading-snug md:block"
                >
                  {panneau.description}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}
