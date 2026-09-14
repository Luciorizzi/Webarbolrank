export type ImpactMilestoneTier = "base" | "drive" | "ally" | "reference" | "leader" | "elite";

export interface ImpactMilestone {
  id: string;
  threshold: number;
  name: string;
  description: string;
  tier: ImpactMilestoneTier;
}

export const IMPACT_MILESTONES: readonly ImpactMilestone[] = [
  { id: "first-impact", threshold: 100, name: "Primer impacto", description: "Alcanzó sus primeros 100 kg aportados.", tier: "base" },
  { id: "momentum", threshold: 500, name: "Impulsor", description: "Convirtió constancia en 500 kg de alimento.", tier: "drive" },
  { id: "ally", threshold: 1_000, name: "Aliado", description: "Superó una tonelada de alimento aportado.", tier: "ally" },
  { id: "reference", threshold: 2_500, name: "Referente", description: "Movilizó 2.500 kg de impacto colectivo.", tier: "reference" },
  { id: "leader", threshold: 5_000, name: "Líder de impacto", description: "Alcanzó 5.000 kg de alimento aportado.", tier: "leader" },
  { id: "elite", threshold: 10_000, name: "Élite solidaria", description: "Superó los 10.000 kg aportados.", tier: "elite" },
] as const;
