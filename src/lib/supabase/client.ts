"use client";
import { createClient } from "@supabase/supabase-js";
import { getPublicSupabaseConfig } from "./config";
import type { Database } from "@/types/database";

export function createBrowserSupabaseClient() {
  const { url, anonKey } = getPublicSupabaseConfig();
  return createClient<Database>(url, anonKey);
}
