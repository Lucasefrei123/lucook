import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

export function creerClientAdmin() {
  const cleSecrete = process.env.SUPABASE_SECRET_KEY;
  if (!cleSecrete) {
    throw new Error("Variable manquante : SUPABASE_SECRET_KEY");
  }

  return createClient(SUPABASE_URL, cleSecrete, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}