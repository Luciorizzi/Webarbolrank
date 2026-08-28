import type { Campaign, CampaignStatus } from "@/types/campaign";

export const campaignStatusLabels: Record<CampaignStatus, string> = {
  fundraising: "En recaudación",
  goal_reached: "Meta cumplida",
  scheduled: "Plantación programada",
  completed: "Actividad realizada",
};

export const campaigns: Campaign[] = [
  {
    id: "tandil", slug: "forestacion-tandil", title: "Forestación Tandil", location: "Tandil, Buenos Aires", ngoName: "Fundación Bosques del Sur", goalAmount: 1_000_000, raisedAmount: 1_000_000, treeGoal: 200, status: "completed", plantingDate: "2026-07-07", publishedAt: "2026-07-09", excerpt: "La primera meta se convirtió en una jornada comunitaria de forestación.", description: "La campaña reunió aportes de distintas comunidades para financiar una jornada de forestación junto a una organización local. Los datos y evidencias son demostrativos en esta etapa.", evidence: ["Registro fotográfico de la jornada (mock)", "Constancia de entrega a la organización (mock)"],
    updates: [
      { id: "u1", campaignId: "tandil", date: "2026-06-01", title: "Campaña iniciada", content: "Publicamos la meta y la organización participante." },
      { id: "u2", campaignId: "tandil", date: "2026-06-20", title: "50% de la meta alcanzada", content: "Las comunidades financiaron la mitad del objetivo." },
      { id: "u3", campaignId: "tandil", date: "2026-06-30", title: "Meta cumplida", content: "Se completó el financiamiento previsto." },
      { id: "u4", campaignId: "tandil", date: "2026-07-07", title: "Jornada de plantación realizada", content: "La actividad programada se llevó adelante en Tandil." },
    ],
  },
  {
    id: "cordoba", slug: "reforestacion-cordoba", title: "Reforestación Córdoba", location: "Sierras de Córdoba", ngoName: "Red Nativa", goalAmount: 1_500_000, raisedAmount: 620_000, treeGoal: 300, status: "fundraising", publishedAt: "2026-08-15", excerpt: "Nueva campaña para apoyar la recuperación de bosque nativo serrano.", description: "Una meta abierta que agrupa aportes para una futura actividad junto a una organización territorial.", evidence: [],
    updates: [{ id: "u5", campaignId: "cordoba", date: "2026-08-15", title: "Campaña iniciada", content: "Comenzó la recaudación del objetivo." }],
  },
  {
    id: "delta", slug: "restauracion-delta", title: "Restauración del Delta", location: "Delta del Paraná", ngoName: "Guardianes del Humedal", goalAmount: 750_000, raisedAmount: 750_000, treeGoal: 150, status: "scheduled", plantingDate: "2026-09-21", publishedAt: "2026-08-22", excerpt: "La meta está completa y la actividad ya tiene fecha confirmada.", description: "Campaña demostrativa orientada a restauración con especies adecuadas al territorio.", evidence: ["Plan de actividad programada (mock)"],
    updates: [{ id: "u6", campaignId: "delta", date: "2026-08-22", title: "Fecha confirmada", content: "La organización confirmó la jornada para septiembre." }],
  },
];

export function findCampaignBySlug(slug: string) { return campaigns.find((campaign) => campaign.slug === slug); }
