export function DataConfigurationError({ message }: { message: string }) {
  return <main className="mx-auto min-h-[65vh] max-w-6xl px-5 py-24 sm:px-8"><p className="eyebrow">Configuración requerida</p><h1 className="mt-4 max-w-3xl font-display text-4xl font-bold uppercase text-white">Conectá Supabase para ver los datos</h1><p className="mt-5 max-w-2xl text-zinc-400">{message}</p><code className="mt-7 block w-fit rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-amber-300">cp .env.example .env.local</code></main>;
}
