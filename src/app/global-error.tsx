"use client";

import Link from "next/link";

import "./globals.css";

export default function ErreurRacine({ error, retry }: { error: unknown; retry: () => void }) {
  const reference = error instanceof Error && "digest" in error ? String(error.digest) : null;

  return (
    <html lang="fr">
      <body className="flex min-h-screen items-center justify-center bg-background p-4 font-sans text-foreground">
        <title>Erreur · Lucook</title>
        <main role="alert" className="flex w-full max-w-lg flex-col gap-4 border border-cloison bg-card p-8">
          <h1 className="font-heading text-2xl">Lucook est momentanément indisponible.</h1>
          <p className="text-muted-foreground">
            Une erreur grave a interrompu l&apos;application. Réessaie dans un instant.
          </p>
          {reference && <p className="font-mono text-xs text-muted-foreground">Référence : {reference}</p>}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => retry()}
              className="inline-flex h-10 items-center rounded-[2px] bg-primary px-5 text-sm font-medium text-primary-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/60"
            >
              Réessayer
            </button>
            <Link
              href="/"
              className="inline-flex h-10 items-center rounded-[2px] border border-cloison px-5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/60"
            >
              Accueil
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
