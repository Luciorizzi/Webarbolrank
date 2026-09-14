export function Notice({ error, message }: { error?: string; message?: string }) { if (!error && !message) return null; return <p role="status" className={`mb-5 rounded-lg border px-4 py-3 text-sm ${error ? "border-red-400/30 bg-red-950/30 text-red-200" : "border-emerald-400/30 bg-emerald-950/30 text-emerald-200"}`}>{error || message}</p>; }
export const field = "w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white";
export function Empty({ children }: { children: React.ReactNode }) { return <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">{children}</p>; }

