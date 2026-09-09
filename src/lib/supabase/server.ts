import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getPublicSupabaseConfig } from "./config";
import type { Database } from "@/types/database";

export function createServerSupabaseClient() {
  const { url, anonKey } = getPublicSupabaseConfig();
  return createClient<Database>(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function createServiceRoleSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Faltan variables server-only para Supabase service role.");
  return createClient<Database>(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
}
