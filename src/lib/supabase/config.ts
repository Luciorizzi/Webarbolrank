export class SupabaseConfigurationError extends Error {
  constructor() { super("Supabase no está configurado. Copiá .env.example a .env.local y completá NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY."); this.name = "SupabaseConfigurationError"; }
}

export function getPublicSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new SupabaseConfigurationError();
  return { url, anonKey };
}
