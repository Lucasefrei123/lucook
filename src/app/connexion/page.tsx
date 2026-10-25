import type { Metadata } from "next";
import { Suspense } from "react";

import { FormulaireConnexion } from "@/components/formulaire-connexion";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Connexion",
};

async function ContenuConnexion({
  searchParams,
}: {
  searchParams: Promise<{ suivant?: string; erreur?: string }>;
}) {
  const { suivant = "/", erreur } = await searchParams;

  return (
    <>
      {erreur === "lien-invalide" && (
        <p role="alert" className="mb-4 border-l-4 border-l-destructive bg-envie-doux px-3 py-2 text-sm">
          Ce lien est invalide ou a expiré. Demande-en un nouveau.
        </p>
      )}
      <FormulaireConnexion suivant={suivant} />
    </>
  );
}

export default function PageConnexion({
  searchParams,
}: {
  searchParams: Promise<{ suivant?: string; erreur?: string }>;
}) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 items-center px-4 py-10">
      <div className="grid w-full gap-px border border-cloison bg-cloison md:grid-cols-2">
        <div className="flex flex-col justify-between gap-8 bg-card p-6 md:p-10">
          <div
            aria-hidden="true"
            className="grid aspect-[4/3] w-40 grid-cols-3 grid-rows-2 gap-1 rounded-[3px] border-4 border-bois-fonce bg-bois-fonce p-1"
          >
            <div className="col-span-2 row-span-2 bg-envie" />
            <div className="bg-frigo" />
            <div className="bg-sport" />
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl md:text-4xl">Bienvenue chez Lucook</h1>
            <p className="text-muted-foreground">
              Ton frigo, tes envies ou tes objectifs : trois recettes composées pour toi, rangées chacune
              dans son compartiment.
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-center gap-6 bg-card p-6 md:p-10">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl">Connexion</h2>
            <p className="text-sm text-muted-foreground">
              Connecte-toi avec ton mot de passe, ou reçois un lien magique par e-mail.
            </p>
          </div>
          <Suspense fallback={<Skeleton className="h-28 w-full rounded-[2px]" />}>
            <ContenuConnexion searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
