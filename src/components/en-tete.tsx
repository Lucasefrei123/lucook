import { LogOut } from "lucide-react";
import Link from "next/link";

import { Navigation } from "@/components/navigation";
import { BoutonTheme } from "@/components/ui/skiper-ui/skiper26";
import { creerClientServeur } from "@/lib/supabase/server";

export function Marque() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 px-4 py-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:ring-inset"
    >
      <span
        aria-hidden="true"
        className="grid size-8 place-items-center rounded-[2px] bg-primary font-heading text-lg leading-none text-primary-foreground"
      >
        食
      </span>
      <span className="font-heading text-xl tracking-wide">Lucook</span>
    </Link>
  );
}

export async function EnTete() {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const admin = user ? (await supabase.rpc("est_admin")).data === true : false;

  return (
    <header className="border-b border-cloison bg-card">
      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto] gap-px bg-cloison md:grid-cols-[auto_1fr_auto] md:border-x md:border-cloison">
        <div className="bg-card">
          <Marque />
        </div>
        <div className="order-last col-span-2 bg-card md:order-none md:col-span-1">
          {user && <Navigation admin={admin} />}
        </div>
        <div className="flex items-center gap-1 bg-card px-3">
          <BoutonTheme />
          {user && (
            <form action="/auth/deconnexion" method="post">
              <button
                type="submit"
                className="flex size-9 items-center justify-center rounded-[2px] text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <LogOut className="size-4" aria-hidden="true" />
                <span className="sr-only">Se déconnecter</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}

export function EnTeteSquelette() {
  return (
    <header className="border-b border-cloison bg-card">
      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto] gap-px bg-cloison md:grid-cols-[auto_1fr_auto] md:border-x md:border-cloison">
        <div className="bg-card">
          <Marque />
        </div>
        <div className="order-last col-span-2 h-11 bg-card md:order-none md:col-span-1 md:h-auto" />
        <div className="flex items-center bg-card px-3">
          <BoutonTheme />
        </div>
      </div>
    </header>
  );
}
