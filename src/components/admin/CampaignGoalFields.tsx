"use client";

import { useState } from "react";
import { calculateCampaignGoalAmount } from "@/config/finance";
import { formatARS } from "@/lib/currency";
import { field } from "./AdminUI";

export function CampaignGoalFields({ initialKg }: { initialKg: number | null }) {
  const [kg, setKg] = useState(initialKg === null ? "" : String(initialKg));
  const numericKg = Number(kg);
  const calculatedAmount = Number.isFinite(numericKg) && numericKg >= 0 ? calculateCampaignGoalAmount(numericKg) : 0;

  return (
    <>
      <label className="text-sm">Objetivo kg
        <input className={`${field} mt-1`} name="impact_goal" type="number" min="0" step="1" value={kg} onChange={(event) => setKg(event.target.value)} />
      </label>
      <div className="rounded-lg border border-white/10 bg-black/15 px-4 py-3" aria-live="polite">
        <p className="text-sm text-zinc-300">Objetivo monetario</p>
        <p className="mt-1 text-xl font-bold text-white">{formatARS(calculatedAmount)}</p>
        <p className="mt-1 text-xs text-zinc-500">Calculado automáticamente</p>
      </div>
    </>
  );
}
