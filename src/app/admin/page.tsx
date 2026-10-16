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
  operationnel: "bg-green-100 text-green-800",
  degrade: "bg-orange-100 text-orange-800",
  en_panne: "bg-red-100 text-red-800",
};

export default async function PageAdmin() {
  if (!(await estAdmin())) notFound();

  const services = await executerTousLesControles();
  const global = etatGlobal(services);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl">Administration</h1>
          <Link href="/" className="underline">
            Retour à l&apos;accueil
          </Link>
        </div>
        <BoutonRafraichir />
      </header>

      <section className={`p-4 ${COULEURS_ETAT[global]}`}>
        <p className="text-lg">État global : {LIBELLES_ETAT[global]}</p>
      </section>

      <section>
        <h2 className="mb-3 text-xl">Services</h2>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">Service</th>
              <th className="py-2">État</th>
              <th className="py-2">Latence</th>
              <th className="py-2">Détail</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.service} className="border-b">
                <td className="py-2">
                  <div>{s.service}</div>
                  <div className="text-sm opacity-60">{s.description}</div>
                </td>
                <td className="py-2">
                  <span className={`px-2 py-1 text-sm ${COULEURS_ETAT[s.etat]}`}>
                    {LIBELLES_ETAT[s.etat]}
                  </span>
                </td>
                <td className="py-2">{s.latenceMs} ms</td>
                <td className="py-2 text-sm">{s.detail ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

    </main>
  );
}