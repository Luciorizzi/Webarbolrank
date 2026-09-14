"use client";
import { useFormStatus } from "react-dom";
export function SubmitButton({ children, tone = "primary" }: { children: React.ReactNode; tone?: "primary" | "secondary" | "danger" }) { const { pending } = useFormStatus(); const colors = tone === "primary" ? "bg-amber-400 text-stone-950" : tone === "danger" ? "border-red-400/40 text-red-300" : "border-white/15 text-white"; return <button type="submit" disabled={pending} className={`rounded-lg border border-transparent px-4 py-2 text-sm font-bold disabled:opacity-50 ${colors}`}>{pending ? "Procesando…" : children}</button>; }

