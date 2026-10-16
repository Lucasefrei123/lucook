"use client";

import { Loader2, MailCheck } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { creerClientNavigateur } from "@/lib/supabase/client";

type Etat =
  | { type: "repos" }
  | { type: "envoi" }
  | { type: "envoye"; email: string }
  | { type: "erreur"; message: string };

export function FormulaireConnexion({ suivant }: { suivant: string }) {
  const [email, setEmail] = useState("");
  const [etat, setEtat] = useState<Etat>({ type: "repos" });

  async function envoyer(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    setEtat({ type: "envoi" });

    const redirection = new URL("/auth/callback", window.location.origin);
    redirection.searchParams.set("suivant", suivant);

    const supabase = creerClientNavigateur();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirection.toString() },
    });

    if (error) {
      setEtat({
        type: "erreur",
        message:
          error.status === 429
            ? "Trop de demandes. Réessaie dans quelques minutes."
            : "Impossible d'envoyer le lien. Vérifie ton adresse e-mail.",
      });
      return;
    }

    setEtat({ type: "envoye", email });
  }

  if (etat.type === "envoye") {
    return (
      <div role="status" className="flex flex-col gap-3 border border-cloison bg-sport-doux p-4">
        <MailCheck className="size-5 text-sport" aria-hidden="true" />
        <p>
          Lien envoyé à <strong className="break-all">{etat.email}</strong>. Ouvre-le dans ce même navigateur.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={envoyer} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Adresse e-mail</Label>
        <Input
          id="email"
          type="email"
          required
          autoComplete="email"
          placeholder="toi@exemple.fr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={etat.type === "erreur" ? true : undefined}
          aria-describedby={etat.type === "erreur" ? "email-erreur" : undefined}
          className="h-11 bg-background"
        />
      </div>
      <button
        type="submit"
        disabled={etat.type === "envoi"}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-[2px] bg-primary px-5 text-sm font-medium text-primary-foreground outline-none transition-colors hover:bg-primary/85 focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-wait disabled:opacity-80"
      >
        {etat.type === "envoi" && (
          <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
        )}
        {etat.type === "envoi" ? "Envoi…" : "Recevoir mon lien de connexion"}
      </button>
      {etat.type === "erreur" && (
        <p id="email-erreur" role="alert" className="text-sm text-destructive">
          {etat.message}
        </p>
      )}
    </form>
  );
}
