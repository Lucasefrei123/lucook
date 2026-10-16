"use client";

import { useState } from "react";
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
      <p>
        Lien envoyé à <strong>{etat.email}</strong>. Ouvre-le dans ce même navigateur.
      </p>
    );
  }

  return (
    <form onSubmit={envoyer} className="flex flex-col gap-3">
      <label htmlFor="email">Adresse e-mail</label>
      <input
        id="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border px-3 py-2"
      />
      <button type="submit" disabled={etat.type === "envoi"} className="border px-3 py-2">
        {etat.type === "envoi" ? "Envoi…" : "Recevoir mon lien de connexion"}
      </button>
      {etat.type === "erreur" && <p role="alert">{etat.message}</p>}
    </form>
  );
}