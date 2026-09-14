import type { CampaignStatusDb } from "@/types/database";

export const campaignStatusLabels: Record<CampaignStatusDb, string> = {
  scheduled: "Programada",
  fundraising: "Recaudando",
  goal_reached: "Objetivo alcanzado",
  completed: "Completada",
};

export const campaignStatusOptions = (
  ["scheduled", "fundraising", "goal_reached", "completed"] as const
).map((value) => ({ value, label: campaignStatusLabels[value] }));

