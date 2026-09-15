import Link from "next/link";

export function PaymentResult({ eyebrow, title, description, retry = false }: { eyebrow: string; title: string; description: string; retry?: boolean }) {
  return <main className="mx-auto grid min-h-[70vh] max-w-6xl place-items-center px-5 py-20"><section className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 text-center sm:p-12"><p className="eyebrow">{eyebrow}</p><h1 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight text-white sm:text-5xl">{title}</h1><p className="mx-auto mt-5 max-w-md text-zinc-400">{description}</p><Link href={retry ? "/#donar" : "/#ranking"} className="mt-8 inline-flex rounded-full bg-amber-400 px-6 py-3 text-sm font-bold uppercase tracking-wide text-amber-950 transition hover:bg-amber-300">{retry ? "Volver a intentar" : "Volver al ranking"}</Link></section></main>;
}
