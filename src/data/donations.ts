import { TREE_PRICE } from "@/config/finance";
import type { Donation, DonorRankingEntry } from "@/types/donation";

export const donations: Donation[] = [
  { id: "d1", donorName: "Lucio", anonymous: false, participantSlug: "davo", trees: 10, amount: 10 * TREE_PRICE, createdAt: "2026-08-28T14:20:00Z" },
  { id: "d2", donorName: "Martín", anonymous: false, participantSlug: null, trees: 5, amount: 5 * TREE_PRICE, createdAt: "2026-08-28T13:54:00Z" },
  { id: "d3", donorName: null, anonymous: true, participantSlug: "spreen", trees: 2, amount: 2 * TREE_PRICE, createdAt: "2026-08-28T13:10:00Z" },
  { id: "d4", donorName: "Nicolás", anonymous: false, participantSlug: "coscu", trees: 320, amount: 320 * TREE_PRICE, createdAt: "2026-08-28T12:42:00Z" },
  { id: "d5", donorName: "Lucio", anonymous: false, participantSlug: "spreen", trees: 205, amount: 205 * TREE_PRICE, createdAt: "2026-08-28T11:30:00Z" },
  { id: "d6", donorName: "Martín", anonymous: false, participantSlug: "momo", trees: 175, amount: 175 * TREE_PRICE, createdAt: "2026-08-27T18:15:00Z" },
];

export function getTopDonors(source: Donation[], limit = 3): DonorRankingEntry[] {
  const totals = new Map<string, number>();
  source.filter((donation) => !donation.anonymous && donation.donorName).forEach((donation) => {
    const name = donation.donorName as string;
    totals.set(name, (totals.get(name) ?? 0) + donation.trees);
  });
  return [...totals.entries()].map(([donorName, trees]) => ({ donorName, trees })).sort((a, b) => b.trees - a.trees).slice(0, limit);
}
