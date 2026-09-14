import "server-only";
import { requireAdmin } from "@/lib/admin/auth";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export async function getAdminDb() {
  await requireAdmin();
  return createServiceRoleSupabaseClient();
}

