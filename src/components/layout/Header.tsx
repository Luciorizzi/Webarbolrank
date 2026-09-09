import Link from "next/link";
import { BRAND_NAME } from "@/config/brand";

const links = [
  { href: "/ranking", label: "Ranking" },
  { href: "/novedades", label: "Novedades" },
  { href: "/como-funciona", label: "Cómo funciona" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#0d0b08]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-white">
          <span className="grid size-8 place-items-center rounded-full bg-amber-400 text-sm text-[#171006]">K</span>
          {BRAND_NAME}
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-zinc-400 md:flex" aria-label="Navegación principal">
          {links.map((link) => <Link key={link.href} href={link.href} className="transition hover:text-white">{link.label}</Link>)}
        </nav>
        <Link href="/#donar" className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-[#171006] transition hover:bg-amber-300">Alimentar</Link>
      </div>
    </header>
  );
}
