import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getPublicSupabaseConfig } from "./config";
import type { Database } from "@/types/database";

export async function createAuthSupabaseClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getPublicSupabaseConfig();
  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(values) {
        try {
          values.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Los Server Components no pueden escribir cookies; proxy.ts refresca la sesión.
        }
      },
    },
  });
}

