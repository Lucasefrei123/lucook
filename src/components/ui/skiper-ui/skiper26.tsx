"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import { useCallback, useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

function abonnementVide() {
  return () => {};
}

export function useBasculeTheme() {
  const { resolvedTheme, setTheme } = useTheme();
  const monte = useSyncExternalStore(
    abonnementVide,
    () => true,
    () => false,
  );
  const sombre = monte && resolvedTheme === "dark";

  const basculer = useCallback(() => {
    const changer = () => setTheme(sombre ? "light" : "dark");
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduit) {
      changer();
      return;
    }
    document.startViewTransition(changer);
  }, [sombre, setTheme]);

  return { sombre, basculer };
}

export function BoutonTheme({ className }: { className?: string }) {
  const { sombre, basculer } = useBasculeTheme();
  const reduit = useReducedMotion();
  const transition = { ease: "easeInOut" as const, duration: reduit ? 0 : 0.5 };
  const libelle = sombre ? "Passer en mode clair" : "Passer en mode sombre";

  return (
    <button
      type="button"
      onClick={basculer}
      aria-label={libelle}
      title={libelle}
      className={cn(
        "size-8 cursor-pointer rounded-full bg-foreground p-0 transition-transform outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95",
        className,
      )}
    >
      <svg viewBox="0 0 240 240" fill="none" aria-hidden="true">
        <motion.g animate={{ rotate: sombre ? -180 : 0 }} transition={transition}>
          <path
            d="M120 67.5C149.25 67.5 172.5 90.75 172.5 120C172.5 149.25 149.25 172.5 120 172.5"
            className="fill-background"
          />
          <path
            d="M120 67.5C90.75 67.5 67.5 90.75 67.5 120C67.5 149.25 90.75 172.5 120 172.5"
            className="fill-foreground"
          />
        </motion.g>
        <motion.path
          animate={{ rotate: sombre ? 180 : 0 }}
          transition={transition}
          d="M120 3.75C55.5 3.75 3.75 55.5 3.75 120C3.75 184.5 55.5 236.25 120 236.25C184.5 236.25 236.25 184.5 236.25 120C236.25 55.5 184.5 3.75 120 3.75ZM120 214.5V172.5C90.75 172.5 67.5 149.25 67.5 120C67.5 90.75 90.75 67.5 120 67.5V25.5C172.5 25.5 214.5 67.5 214.5 120C214.5 172.5 172.5 214.5 120 214.5Z"
          className="fill-background"
        />
      </svg>
    </button>
  );
}
