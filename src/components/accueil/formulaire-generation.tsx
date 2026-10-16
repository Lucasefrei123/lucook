"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";

import { ChampsEnvie } from "@/components/accueil/champs-envie";
import { ChampsFrigo } from "@/components/accueil/champs-frigo";
import { ChampsSport } from "@/components/accueil/champs-sport";
import {
  idChamp,
  type ValeursEnvie,
  type ValeursFrigo,
  type ValeursSport,
} from "@/components/accueil/types";
import { PanneauxExtensibles, type Panneau } from "@/components/ui/skiper-ui/skiper52";
import { envoyerGeneration } from "@/lib/envoi-generation";
import { erreursDepuisZod, type ErreursChamps } from "@/lib/erreurs-formulaire";
import { STYLES_MODE, type Objectif } from "@/lib/modes";
import { entreesSchema, LIMITES, MODES, type Mode } from "@/lib/recette";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const PANNEAUX: Panneau<Mode>[] = MODES.map((mode) => {
  const style = STYLES_MODE[mode];
  const Icone = style.icone;
  return {
    cle: mode,
    titre: style.titre,
    description: style.description,
    icone: <Icone />,
    classeActive: style.plein,
    classeRepos: style.repos,
  };
});

type Etape = "repos" | "photo" | "api" | "redirection";

function nombre(valeur: string) {
  const texte = valeur.trim().replace(",", ".");
  if (!texte) return null;
  const resultat = Number(texte);
  return Number.isFinite(resultat) ? resultat : Number.NaN;
}

export function FormulaireGeneration({
  idUtilisateur,
  objectifParDefaut,
}: {
  idUtilisateur: string;
  objectifParDefaut: Objectif | null;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("frigo");
  const [frigo, setFrigo] = useState<ValeursFrigo>({ ingredients: "", photo: null });
  const [envie, setEnvie] = useState<ValeursEnvie>({
    envie: "",
    tempsMax: "",
    budget: null,
    difficulte: null,
  });
  const [sport, setSport] = useState<ValeursSport>({
    objectif: objectifParDefaut,
    kcal: "",
    proteines: "",
    glucides: "",
    lipides: "",
    precisions: "",
  });
  const [erreurs, setErreurs] = useState<ErreursChamps>({});
  const [erreurGlobale, setErreurGlobale] = useState<string | null>(null);
  const [etape, setEtape] = useState<Etape>("repos");
  const photoEnvoyee = useRef<{ fichier: File; chemin: string } | null>(null);
  const occupe = etape !== "repos";
  const style = STYLES_MODE[mode];

  function construireEntrees(cheminPhoto: string | null) {
    if (mode === "frigo") {
      return { mode, ingredients: frigo.ingredients.trim(), cheminPhoto };
    }
    if (mode === "envie") {
      return {
        mode,
        envie: envie.envie.trim(),
        tempsMax: nombre(envie.tempsMax),
        budget: envie.budget,
        difficulte: envie.difficulte,
      };
    }
    const cibles = {
      kcal: nombre(sport.kcal),
      proteines: nombre(sport.proteines),
      glucides: nombre(sport.glucides),
      lipides: nombre(sport.lipides),
    };
    const aucuneCible = Object.values(cibles).every((valeur) => valeur === null);
    return {
      mode,
      objectif: sport.objectif,
      cibles: aucuneCible ? null : cibles,
      precisions: sport.precisions.trim(),
    };
  }

  function signalerErreurs(nouvelles: ErreursChamps) {
    setErreurs(nouvelles);
    const premier = Object.keys(nouvelles)[0];
    if (premier) document.getElementById(idChamp(premier))?.focus();
  }

  async function envoyerPhoto(fichier: File) {
    if (photoEnvoyee.current?.fichier === fichier) return photoEnvoyee.current.chemin;
    const chemin = `${idUtilisateur}/${crypto.randomUUID()}.${EXTENSIONS[fichier.type] ?? "jpg"}`;
    const supabase = creerClientNavigateur();
    const { error } = await supabase.storage
      .from("photos-frigo")
      .upload(chemin, fichier, { contentType: fichier.type, upsert: false });
    if (error) return null;
    photoEnvoyee.current = { fichier, chemin };
    return chemin;
  }

  async function soumettre(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    if (occupe) return;
    setErreurGlobale(null);

    const photo = mode === "frigo" ? frigo.photo : null;
    const verification = entreesSchema.safeParse(construireEntrees(photo ? "photo" : null));
    if (!verification.success) {
      signalerErreurs(erreursDepuisZod(verification.error.issues));
      return;
    }
    setErreurs({});

    let cheminPhoto: string | null = null;
    if (photo) {
      if (photo.size > LIMITES.taillePhotoMax) {
        signalerErreurs({ cheminPhoto: "La photo dépasse 5 Mo." });
        return;
      }
      setEtape("photo");
      cheminPhoto = await envoyerPhoto(photo);
      if (!cheminPhoto) {
        setEtape("repos");
        setErreurGlobale("La photo n'a pas pu être envoyée. Réessaie ou retire-la.");
        return;
      }
    }

    const analyse = entreesSchema.safeParse(construireEntrees(cheminPhoto));
    if (!analyse.success) {
      setEtape("repos");
      signalerErreurs(erreursDepuisZod(analyse.error.issues));
      return;
    }

    setEtape("api");
    const resultat = await envoyerGeneration(analyse.data);

    if (resultat.type === "ok") {
      setEtape("redirection");
      router.push(`/generations/${resultat.id}`);
      return;
    }

    setEtape("repos");
    if (resultat.type === "champs") {
      signalerErreurs(resultat.champs);
      setErreurGlobale(resultat.erreur);
      return;
    }
    setErreurGlobale(resultat.erreur);
  }

  const libelleBouton =
    etape === "photo"
      ? "Envoi de la photo…"
      : etape === "api" || etape === "redirection"
        ? "On passe en cuisine…"
        : "Composer 3 recettes";

  return (
    <form noValidate onSubmit={soumettre} aria-busy={occupe} className="flex flex-col">
      <div className="grid gap-px border border-cloison bg-cloison">
        <PanneauxExtensibles
          libelle="Mode de génération"
          panneaux={PANNEAUX}
          valeur={mode}
          surChangement={(nouveau) => {
            if (occupe) return;
            setMode(nouveau);
            setErreurs({});
            setErreurGlobale(null);
          }}
        />
        <div className={cn("border-t-2 bg-card p-5 md:p-8", style.trait)}>
          <h2 className="sr-only">Formulaire {style.titre}</h2>
          {mode === "frigo" && (
            <ChampsFrigo valeurs={frigo} surChangement={setFrigo} erreurs={erreurs} desactive={occupe} />
          )}
          {mode === "envie" && (
            <ChampsEnvie valeurs={envie} surChangement={setEnvie} erreurs={erreurs} desactive={occupe} />
          )}
          {mode === "sport" && (
            <ChampsSport valeurs={sport} surChangement={setSport} erreurs={erreurs} desactive={occupe} />
          )}
        </div>
        <div className="flex flex-col gap-4 bg-card p-4 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <p className="text-xs text-muted-foreground">
            <span className="font-mono">{LIMITES.quotaParHeure}</span> générations par heure · 3
            recettes à chaque fois
          </p>
          <button
            type="submit"
            disabled={occupe}
            className={cn(
              "inline-flex h-11 items-center justify-center gap-2 rounded-[2px] px-6 text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-wait disabled:opacity-80",
              style.bouton,
            )}
          >
            {occupe ? (
              <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            ) : null}
            {libelleBouton}
            {!occupe && <ArrowRight className="size-4" aria-hidden="true" />}
          </button>
        </div>
      </div>
      {erreurGlobale && (
        <div
          role="alert"
          className="mt-4 border border-destructive/40 border-l-4 border-l-destructive bg-card px-4 py-3 text-sm"
        >
          {erreurGlobale}
        </div>
      )}
    </form>
  );
}
