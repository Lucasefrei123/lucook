"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

export function FournisseurTheme({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}
