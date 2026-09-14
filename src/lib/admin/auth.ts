import "server-only";
import { redirect } from "next/navigation";
import { createAuthSupabaseClient } from "@/lib/supabase/auth-server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export type AdminIdentity = { userId: string; email: string | null };

export async function getAdminIdentity(): Promise<AdminIdentity | null> {
  const auth = await createAuthSupabaseClient();
  const { data: { user }, error } = await auth.auth.getUser();
  if (error || !user) return null;
  const { data } = await createServiceRoleSupabaseClient().from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  return data ? { userId: user.id, email: user.email ?? null } : null;
}

export async function requireAdmin(): Promise<AdminIdentity> {
  const admin = await getAdminIdentity();
  if (!admin) redirect("/admin/login?error=unauthorized");
  return admin;
}

