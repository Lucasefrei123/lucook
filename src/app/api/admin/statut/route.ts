import { NextResponse } from "next/server";
import { estAdmin } from "@/lib/admin";
import { etatGlobal } from "@/lib/controles";
import { executerTousLesControles } from "@/lib/statut";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await estAdmin())) {
    return NextResponse.json({ erreur: "Introuvable" }, { status: 404 });
  }

  const services = await executerTousLesControles();

  return NextResponse.json(
    { etat: etatGlobal(services), horodatage: new Date().toISOString(), services },
    { headers: { "Cache-Control": "no-store" } },
  );
}