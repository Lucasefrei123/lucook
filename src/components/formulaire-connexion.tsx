"use client";

import { Loader2, MailCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { creerClientNavigateur } from "@/lib/supabase/client";

type Etat =
  | { type: "repos" }
  | { type: "envoi" }
  | { type: "envoye"; email: string }
  | { type: "erreur"; message: string };

const CLASSE_BOUTON =
  "inline-flex h-11 items-center justify-center gap-2 rounded-[2px] bg-primary px-5 text-sm font-medium text-primary-foreground outline-none transition-colors hover:bg-primary/85 focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-wait disabled:opacity-80";

function Chargement() {
  return <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />;
}

function FormulaireMotDePasse({ suivant }: { suivant: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function connecter(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    setEnvoi(true);
    setErreur(null);

    const supabase = creerClientNavigateur();
    const { error } = await supabase.auth.signInWithPassword({ email, password: motDePasse });

    if (error) {
      setEnvoi(false);
      setErreur(
        error.status === 429
          ? "Trop de demandes. Réessaie dans quelques minutes."
          : error.code === "email_not_confirmed"
            ? "Ce compte n'est pas encore confirmé."
            : error.code === "invalid_credentials"
              ? "E-mail ou mot de passe incorrect."
              : "Connexion impossible pour le moment. Réessaie dans un instant.",
      );
      return;
    }

    router.replace(suivant.startsWith("/") && !suivant.startsWith("//") ? suivant : "/");
    router.refresh();
  }

  return (
    <form onSubmit={connecter} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email-mot-de-passe">Adresse e-mail</Label>
        <Input
          id="email-mot-de-passe"
          type="email"
          required
          autoComplete="email"
          placeholder="toi@exemple.fr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={erreur ? true : undefined}
          aria-describedby={erreur ? "mot-de-passe-erreur" : undefined}
          className="h-11 bg-background"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="mot-de-passe">Mot de passe</Label>
        <Input
          id="mot-de-passe"
          type="password"
          required
          autoComplete="current-password"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          aria-invalid={erreur ? true : undefined}
          aria-describedby={erreur ? "mot-de-passe-erreur" : undefined}
          className="h-11 bg-background"
        />
      </div>
      <button type="submit" disabled={envoi} className={CLASSE_BOUTON}>
        {envoi && <Chargement />}
        {envoi ? "Connexion…" : "Se connecter"}
      </button>
      {erreur && (
        <p id="mot-de-passe-erreur" role="alert" className="text-sm text-destructive">
          {erreur}
        </p>
      )}
    </form>
  );
}

function FormulaireLienMagique({ suivant }: { suivant: string }) {
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
      <button type="submit" disabled={etat.type === "envoi"} className={CLASSE_BOUTON}>
        {etat.type === "envoi" && <Chargement />}
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

export function FormulaireConnexion({ suivant }: { suivant: string }) {
  return (
    <Tabs defaultValue="mot-de-passe" className="flex flex-col gap-5">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="mot-de-passe">Mot de passe</TabsTrigger>
        <TabsTrigger value="lien-magique">Lien magique</TabsTrigger>
      </TabsList>
      <TabsContent value="mot-de-passe">
        <FormulaireMotDePasse suivant={suivant} />
      </TabsContent>
      <TabsContent value="lien-magique">
        <FormulaireLienMagique suivant={suivant} />
      </TabsContent>
    </Tabs>
  );
}
