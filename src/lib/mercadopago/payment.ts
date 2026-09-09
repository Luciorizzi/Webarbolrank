import type { DonationStatus } from "@/types/database";

const PAYMENT_STATUS_MAP: Record<string, DonationStatus> = {
  approved: "approved",
  authorized: "pending",
  pending: "pending",
  in_process: "pending",
  in_mediation: "pending",
  rejected: "rejected",
  cancelled: "rejected",
  refunded: "refunded",
  charged_back: "refunded",
};

export function mapMercadoPagoStatus(status: string | null | undefined): DonationStatus | null {
  return status ? PAYMENT_STATUS_MAP[status] ?? null : null;
}

export function amountsMatch(expected: number, received: number | null | undefined): boolean {
  return typeof received === "number" && Number.isFinite(received) && received === expected;
}

export function resolveDonationStatus(current: DonationStatus, received: DonationStatus): DonationStatus {
  if (current === "refunded") return "refunded";
  if (current === "approved" && received !== "refunded") return "approved";
  return received;
}
