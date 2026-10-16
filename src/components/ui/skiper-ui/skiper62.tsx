"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export function useBoucle(delai = 1000, actif = true) {
  const [cle, setCle] = useState(0);

  useEffect(() => {
    if (!actif) return;
    const intervalle = setInterval(() => setCle((precedente) => precedente + 1), delai);
    return () => clearInterval(intervalle);
  }, [delai, actif]);

  return cle;
}

export function TexteEnBoucle({
  phrases,
  delai = 2400,
  className,
}: {
  phrases: readonly string[];
  delai?: number;
  className?: string;
}) {
  const reduit = useReducedMotion();
  const cle = useBoucle(delai, !reduit);
  const phrase = phrases[cle % phrases.length];

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.p
          key={cle}
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "-100%" }}
          transition={{ duration: 0.3 }}
        >
          {phrase}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
