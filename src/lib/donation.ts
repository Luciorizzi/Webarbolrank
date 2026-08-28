import { TREE_PRICE } from "@/config/finance";

export function calculateDonationTotal(trees: number): number {
  if (!Number.isInteger(trees) || trees < 1) {
    throw new Error("La cantidad de árboles debe ser un entero mayor o igual a 1.");
  }

  return trees * TREE_PRICE;
}
