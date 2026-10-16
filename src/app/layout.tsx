import type { Metadata } from "next";
import { IBM_Plex_Mono, Shippori_Mincho, Zen_Kaku_Gothic_New } from "next/font/google";
import { Suspense } from "react";

import { EnTete, EnTeteSquelette } from "@/components/en-tete";
import { FournisseurTheme } from "@/components/fournisseur-theme";
import { PiedDePage } from "@/components/pied-de-page";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const shippori = Shippori_Mincho({
  variable: "--font-shippori",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const zenKaku = Zen_Kaku_Gothic_New({
  variable: "--font-zen-kaku",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Lucook",
    template: "%s · Lucook",
  },
  description: "Des recettes composées par IA à partir de ton frigo, de tes envies ou de tes objectifs sportifs.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${shippori.variable} ${zenKaku.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <FournisseurTheme>
          <a
            href="#contenu"
            className="sr-only z-50 bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
          >
            Aller au contenu
          </a>
          <Suspense fallback={<EnTeteSquelette />}>
            <EnTete />
          </Suspense>
          <div id="contenu" className="flex flex-1 flex-col">
            {children}
          </div>
          <PiedDePage />
          <Toaster position="bottom-center" />
        </FournisseurTheme>
      </body>
    </html>
  );
}
