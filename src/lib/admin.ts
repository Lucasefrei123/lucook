import "server-only";
import { creerClientServeur } from "./supabase/server";

export async function estAdmin(): Promise<boolean> {
  const supabase = await creerClientServeur();
  const { data } = await supabase.rpc("est_admin");
  return data === true;
}
