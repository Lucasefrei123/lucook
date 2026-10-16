import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import { BlocMacros } from "@/components/recettes/bloc-macros";
import { BoutonFavori } from "@/components/recettes/bouton-favori";
import { MetaRecette } from "@/components/recettes/carte-recette";
import { Etapes } from "@/components/recettes/etapes";
import { ListeIngredients } from "@/components/recettes/liste-ingredients";
import { COLONNES_RECETTE } from "@/lib/colonnes";
import { formaterDate, MOTIF_UUID, STYLES_MODE } from "@/lib/modes";
import type { LigneRecette, Mode } from "@/lib/recette";
import { creerClientServeur } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

type RecetteDetaillee = LigneRecette & {
  generations: { mode: Mode; chemin_photo: string | null } | null;
};

const chargerRecette = cache(async (id: string) => {
  if (!MOTIF_UUID.test(id)) return null;
  const supabase = await creerClientServeur();
  const { data, error } = await supabase
    .from("recettes")
    .select(`${COLONNES_RECETTE}, generations(mode, chemin_photo)`)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Impossible de charger la recette.");
  return data as RecetteDetaillee | null;
});

export async function generateMetadata({ params }: PageProps<"/recettes/[id]">): Promise<Metadata> {
  const { id } = await params;
  const recette = await chargerRecette(id);
  return { title: recette?.titre ?? "Recette" };
}

export default async function PageRecette({ params }: PageProps<"/recettes/[id]">) {
  const { id } = await params;
  const recette = await chargerRecette(id);
  if (!recette) notFound();

  const mode = recette.generations?.mode ?? null;
  const style = mode ? STYLES_MODE[mode] : null;
  const cheminPhoto = recette.generations?.chemin_photo ?? null;

  let urlPhoto: string | null = null;
  if (cheminPhoto) {
    const supabase = await creerClientServeur();
    const { data } = await supabase.storage.from("photos-frigo").createSignedUrl(cheminPhoto, 300);
    urlPhoto = data?.signedUrl ?? null;
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 md:py-10">
      <Link
        href="/recettes"
        className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Mes recettes
      </Link>

      <article className="grid gap-px border border-cloison bg-cloison lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <header className="flex flex-col gap-4 bg-card p-6 md:p-8 lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {style && (
              <span className={cn("px-1.5 py-0.5 font-medium tracking-wide uppercase", style.plein)}>
                {style.titre}
              </span>
            )}
            <span className="font-mono text-muted-foreground">{formaterDate(recette.created_at)}</span>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex max-w-3xl flex-col gap-3">
              <h1 className="text-3xl leading-tight md:text-5xl">{recette.titre}</h1>
              {recette.description && (
                <p className="text-muted-foreground md:text-lg">{recette.description}</p>
              )}
            </div>
            <div className="shrink-0">
              <BoutonFavori recetteId={recette.id} titre={recette.titre} favori={recette.favori} avecLibelle />
            </div>
          </div>
          <MetaRecette recette={recette} className="text-sm" />
          {recette.tags.length > 0 && (
            <ul className="flex flex-wrap gap-1.5" aria-label="Étiquettes">
              {recette.tags.map((tag) => (
                <li key={tag} className="border border-cloison px-2 py-0.5 text-xs text-muted-foreground">
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </header>

        <div className="flex flex-col gap-px bg-cloison">
          {urlPhoto && (
            <figure className="flex flex-col gap-2 bg-card p-4">
              <Image
                src={urlPhoto}
                alt="Photo du frigo envoyée pour cette génération"
                width={640}
                height={480}
                unoptimized
                className="aspect-[4/3] w-full rounded-[2px] object-cover"
              />
              <figcaption className="text-xs text-muted-foreground">Ta photo de départ</figcaption>
            </figure>
          )}
          <section className="flex-1 bg-card p-6 md:p-8">
            <ListeIngredients ingredients={recette.ingredients} />
          </section>
          {recette.macros && (
            <div className="bg-card p-6 md:p-8">
              <BlocMacros macros={recette.macros} />
            </div>
          )}
        </div>

        <section className="bg-card p-6 md:p-8">
          <Etapes etapes={recette.etapes} />
        </section>
      </article>
    </main>
  );
}
