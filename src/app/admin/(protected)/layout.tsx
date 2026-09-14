import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { logoutAction } from "../actions";
import { SubmitButton } from "@/components/admin/SubmitButton";

const links = [["/admin", "Dashboard"], ["/admin/participantes", "Participantes"], ["/admin/campanas", "Campañas"], ["/admin/donaciones", "Donaciones"]];
export default async function AdminLayout({ children }: { children: React.ReactNode }) { const admin = await requireAdmin(); return <main className="mx-auto min-h-[75vh] max-w-7xl px-5 py-8"><div className="mb-8 rounded-xl border border-white/10 bg-white/[.03] p-4"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="eyebrow">KILO ADMIN</p><p className="mt-1 text-xs text-zinc-500">{admin.email}</p></div><nav className="flex flex-wrap gap-2" aria-label="Administración">{links.map(([href,label]) => <Link key={href} href={href} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:border-amber-400/40 hover:text-white">{label}</Link>)}<Link href="/" className="rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300">Sitio público</Link><form action={logoutAction}><SubmitButton tone="secondary">Salir</SubmitButton></form></nav></div></div>{children}</main>; }

