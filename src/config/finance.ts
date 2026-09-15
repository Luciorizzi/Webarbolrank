export const DONATION_UNIT_PRICE = 5_000;
export const KG_PER_DONATION_UNIT = 1;
export const MAX_DONATION_UNITS = 1_000;
export const MAX_IMPACT_KG = MAX_DONATION_UNITS * KG_PER_DONATION_UNIT;
export const IMPACT_UNIT_SINGULAR = "kg";
export const IMPACT_UNIT_PLURAL = "kg";
export const IMPACT_LABEL = "kg de alimento aportados";
export const DONATION_UNIT_PRESETS = [1, 5, 10, 20] as const;

export function calculateCampaignGoalAmount(impactKg: number): number {
  return impactKg / KG_PER_DONATION_UNIT * DONATION_UNIT_PRICE;
}

const impactFormatter = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 2,
});

export function normalizeImpactUnits(value: unknown): number {
  const units = typeof value === "number" ? value : Number(value);
  return Number.isFinite(units) && units >= 0 ? units : 0;
}

export function formatImpactKg(value: unknown): string {
  const units = normalizeImpactUnits(value);
  return `${impactFormatter.format(units)} ${units === 1 ? IMPACT_UNIT_SINGULAR : IMPACT_UNIT_PLURAL}`;
}
