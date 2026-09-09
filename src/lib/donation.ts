import { DONATION_UNIT_PRICE, KG_PER_DONATION_UNIT } from "@/config/finance";

export function calculateDonationTotal(impactUnits: number): number {
  const donationUnits = impactUnits / KG_PER_DONATION_UNIT;
  if (!Number.isInteger(impactUnits) || impactUnits < KG_PER_DONATION_UNIT || !Number.isInteger(donationUnits)) {
    throw new Error("La cantidad de kilogramos no corresponde a una unidad de aporte válida.");
  }

  return donationUnits * DONATION_UNIT_PRICE;
}
