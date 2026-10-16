import Link from "next/link";

export default function PageIntrouvable() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 md:py-16">
      <div className="grid gap-px border border-cloison bg-cloison md:grid-cols-[auto_1fr]">
        <div className="flex items-center justify-center bg-card p-8 md:p-12" aria-hidden="true">
          <div className="grid aspect-[4/3] w-40 grid-cols-3 grid-rows-2 gap-1 rounded-[3px] border-4 border-bois bg-bois p-1">
            <div className="col-span-2 row-span-2 grid place-items-center bg-background font-mono text-2xl text-muted-foreground">
              404
            </div>
            <div className="bg-background" />
            <div className="bg-background" />
          </div>
        </div>
        <div className="flex flex-col gap-4 bg-card p-6 md:p-10">
          <h1 className="text-2xl md:text-3xl">Ce compartiment est vide.</h1>
          <p className="max-w-prose text-muted-foreground">
            La page demandée n&apos;existe pas, ou elle ne t&apos;appartient pas.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex h-10 items-center rounded-[2px] bg-primary px-5 text-sm font-medium text-primary-foreground outline-none transition-colors hover:bg-primary/85 focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              Retour à l&apos;accueil
            </Link>
            <Link
              href="/recettes"
              className="inline-flex h-10 items-center rounded-[2px] border border-cloison px-5 text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/60"
            >
              Mes recettes
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
