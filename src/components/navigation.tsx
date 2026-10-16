"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LIENS = [
  { href: "/", libelle: "Accueil" },
  { href: "/recettes", libelle: "Mes recettes" },
  { href: "/profil", libelle: "Profil" },
] as const;

export function Navigation({ admin }: { admin: boolean }) {
  const chemin = usePathname();
  const liens = admin ? [...LIENS, { href: "/admin", libelle: "Admin" } as const] : LIENS;

  function estActif(href: string) {
    if (href === "/") return chemin === "/" || chemin.startsWith("/generations");
    return chemin === href || chemin.startsWith(`${href}/`);
  }

  return (
    <nav aria-label="Navigation principale" className="flex h-full">
      <ul className="flex h-full w-full gap-px bg-cloison">
        {liens.map((lien) => {
          const actif = estActif(lien.href);
          return (
            <li key={lien.href} className="flex flex-1 md:flex-none">
              <Link
                href={lien.href}
                aria-current={actif ? "page" : undefined}
                className={cn(
                  "relative flex w-full items-center justify-center px-3 py-3 text-sm whitespace-nowrap outline-none transition-colors focus-visible:z-10 focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:ring-inset md:px-5",
                  actif
                    ? "bg-background font-medium text-foreground after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-primary"
                    : "bg-card text-muted-foreground hover:bg-background hover:text-foreground",
                )}
              >
                {lien.libelle}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
