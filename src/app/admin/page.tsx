import Link from "next/link";
import { notFound } from "next/navigation";
import { BoutonRafraichir } from "@/components/bouton-rafraichir";
import { estAdmin } from "@/lib/admin";
import { etatGlobal, type EtatService } from "@/lib/controles";
import { executerTousLesControles } from "@/lib/statut";

export const dynamic = "force-dynamic";

const LIBELLES_ETAT: Record<EtatService, string> = {
  operationnel: "Opérationnel",
  degrade: "Dégradé",
  en_panne: "En panne",
};

const COULEURS_ETAT: Record<EtatService, string> = {
  operationnel: "bg-sport-doux text-sport",
  degrade: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  en_panne: "bg-envie-doux text-destructive",
};

export default async function PageAdmin() {
  if (!(await estAdmin())) notFound();

  const services = await executerTousLesControles();
  const global = etatGlobal(services);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <Link
            href="/"
            className="text-sm text-muted-foreground underline underline-offset-4 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            Retour à l&apos;accueil
          </Link>
          <h1 className="text-3xl md:text-4xl">Administration</h1>
        </div>
        <BoutonRafraichir />
      </header>

      <section className={`border border-cloison p-5 ${COULEURS_ETAT[global]}`}>
        <p className="font-mono text-xs tracking-widest uppercase opacity-80">État global</p>
        <p className="font-heading text-2xl">{LIBELLES_ETAT[global]}</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl">Services</h2>
        <div className="overflow-x-auto border border-cloison bg-card">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead className="bg-muted">
              <tr className="border-b border-cloison">
                <th className="px-4 py-3 font-medium">Service</th>
                <th className="px-4 py-3 font-medium">État</th>
                <th className="px-4 py-3 font-medium">Latence</th>
                <th className="px-4 py-3 font-medium">Détail</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.service} className="border-b border-cloison last:border-b-0">
                  <td className="px-4 py-3">
                    <div className="font-medium">{s.service}</div>
                    <div className="text-xs text-muted-foreground">{s.description}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium ${COULEURS_ETAT[s.etat]}`}>
                      {LIBELLES_ETAT[s.etat]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono">{s.latenceMs} ms</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.detail ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
