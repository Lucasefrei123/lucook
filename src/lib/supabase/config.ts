const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const clePublique = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !clePublique) {
  throw new Error(
    "Variables manquantes : NEXT_PUBLIC_SUPABASE_URL et/ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );
}

export const SUPABASE_URL = url;
export const SUPABASE_CLE_PUBLIQUE = clePublique;