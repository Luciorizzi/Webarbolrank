import { redirect } from "next/navigation";
import { getAdminIdentity } from "@/lib/admin/auth";
import { loginAction } from "../actions";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { Notice, field } from "@/components/admin/AdminUI";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getAdminIdentity()) redirect("/admin");
  const { error } = await searchParams;
  return <main className="mx-auto grid min-h-[70vh] max-w-md place-items-center px-5 py-16"><section className="w-full rounded-2xl border border-white/10 bg-white/[.03] p-7"><p className="eyebrow">KILO ADMIN</p><h1 className="mt-2 text-3xl font-black text-white">Iniciar sesión</h1><p className="mt-2 text-sm text-zinc-400">Acceso exclusivo para administradores autorizados.</p><div className="mt-6"><Notice error={error} /></div><form action={loginAction} className="space-y-4"><label className="block text-sm">Email<input className={`${field} mt-1`} type="email" name="email" autoComplete="email" required /></label><label className="block text-sm">Contraseña<input className={`${field} mt-1`} type="password" name="password" autoComplete="current-password" required /></label><SubmitButton>Ingresar</SubmitButton></form></section></main>;
}

