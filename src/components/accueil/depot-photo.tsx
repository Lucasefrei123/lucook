"use client";

import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useMemo, useState, type DragEvent } from "react";

import { ErreurChamp } from "@/components/formulaire/champ";
import { LIMITES } from "@/lib/recette";
import { cn } from "@/lib/utils";

const TYPES_ACCEPTES: readonly string[] = LIMITES.typesPhoto;

export function verifierPhoto(fichier: File): string | null {
  if (!TYPES_ACCEPTES.includes(fichier.type)) {
    return "Format non pris en charge : utilise une photo JPEG, PNG ou WebP.";
  }
  if (fichier.size > LIMITES.taillePhotoMax) {
    return "La photo dépasse 5 Mo.";
  }
  return null;
}

function formaterTaille(octets: number) {
  return octets < 1024 * 1024
    ? `${Math.round(octets / 1024)} Ko`
    : `${(octets / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
}

export function DepotPhoto({
  photo,
  surChangement,
  erreur,
  desactive,
}: {
  photo: File | null;
  surChangement: (photo: File | null) => void;
  erreur?: string;
  desactive?: boolean;
}) {
  const [erreurLocale, setErreurLocale] = useState<string | null>(null);
  const [survol, setSurvol] = useState(false);
  const apercu = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);
  const message = erreurLocale ?? erreur;

  function choisir(fichier: File | undefined) {
    if (!fichier) return;
    const probleme = verifierPhoto(fichier);
    setErreurLocale(probleme);
    surChangement(probleme ? null : fichier);
  }

  function deposer(evenement: DragEvent<HTMLLabelElement>) {
    evenement.preventDefault();
    setSurvol(false);
    if (!desactive) choisir(evenement.dataTransfer.files[0]);
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium" id="photo-libelle">
        Photo du frigo <span className="font-normal text-muted-foreground">(facultatif)</span>
      </span>
      {photo && apercu ? (
        <div className="flex items-center gap-4 border border-cloison bg-frigo-doux p-3">
          <Image
            src={apercu}
            alt="Aperçu de la photo choisie"
            width={80}
            height={80}
            unoptimized
            className="size-20 shrink-0 rounded-[2px] object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">{photo.name}</p>
            <p className="font-mono text-xs text-muted-foreground">{formaterTaille(photo.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setErreurLocale(null);
              surChangement(null);
            }}
            disabled={desactive}
            className="flex size-9 items-center justify-center rounded-[2px] text-muted-foreground outline-none hover:bg-background hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
          >
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Retirer la photo</span>
          </button>
        </div>
      ) : (
        <label
          onDragOver={(evenement) => {
            evenement.preventDefault();
            setSurvol(true);
          }}
          onDragLeave={() => setSurvol(false)}
          onDrop={deposer}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed px-4 py-8 text-center transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/60",
            survol ? "border-frigo bg-frigo-doux" : "border-bois bg-background hover:bg-frigo-doux",
            message && "border-destructive",
          )}
        >
          <ImagePlus className="size-6 text-frigo" aria-hidden="true" />
          <span className="text-sm">
            <span className="font-medium text-frigo underline underline-offset-4">Choisis une photo</span>{" "}
            ou glisse-la ici
          </span>
          <span className="font-mono text-xs text-muted-foreground">JPEG, PNG ou WebP · 5 Mo max</span>
          <input
            type="file"
            accept={TYPES_ACCEPTES.join(",")}
            className="sr-only"
            aria-labelledby="photo-libelle"
            aria-describedby={message ? "photo-erreur" : undefined}
            disabled={desactive}
            onChange={(evenement) => {
              choisir(evenement.target.files?.[0]);
              evenement.target.value = "";
            }}
          />
        </label>
      )}
      <ErreurChamp id="photo-erreur" message={message ?? undefined} />
    </div>
  );
}
