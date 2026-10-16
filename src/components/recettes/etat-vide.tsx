import Link from "next/link";

export function EtatVide({
  titre,
  texte,
  lien,
}: {
  titre: string;
  texte: string;
  lien?: { href: string; libelle: string };
}) {
  return (
    <div className="grid gap-px border border-cloison bg-cloison md:grid-cols-[auto_1fr]">
      <div className="flex items-center justify-center bg-card p-8 md:p-10" aria-hidden="true">
        <div className="grid aspect-[4/3] w-40 grid-cols-3 grid-rows-2 gap-1 rounded-[3px] border-4 border-bois bg-bois p-1">
          <div className="col-span-2 row-span-2 bg-background" />
          <div className="bg-background" />
          <div className="bg-background" />
        </div>
      </div>
      <div className="flex flex-col justify-center gap-3 bg-card p-6 md:p-10">
        <h2 className="text-2xl">{titre}</h2>
        <p className="max-w-prose text-muted-foreground">{texte}</p>
        {lien && (
          <Link
            href={lien.href}
            className="mt-2 inline-flex h-10 w-fit items-center rounded-[2px] bg-primary px-5 text-sm font-medium text-primary-foreground outline-none transition-colors hover:bg-primary/85 focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            {lien.libelle}
          </Link>
        )}
      </div>
    </div>
  );
}
