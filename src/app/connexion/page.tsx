import { Suspense } from "react";
import { FormulaireConnexion } from "@/components/formulaire-connexion";

async function ContenuConnexion({
  searchParams,
}: {
  searchParams: Promise<{ suivant?: string; erreur?: string }>;
}) {
  const { suivant = "/", erreur } = await searchParams;

  return (
    <>
      {erreur === "lien-invalide" && (
        <p role="alert" className="mb-4">
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
    <main className="mx-auto max-w-sm p-8">
      <h1 className="mb-6 text-2xl">Connexion</h1>
      <Suspense fallback={<p>Chargement…</p>}>
        <ContenuConnexion searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
