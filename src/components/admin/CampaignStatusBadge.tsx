import { campaignStatusLabels } from "@/config/campaign-status";
import type { CampaignStatusDb } from "@/types/database";

const styles: Record<CampaignStatusDb, string> = {
  scheduled: "border-violet-400/25 bg-violet-400/10 text-violet-300",
  fundraising: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  goal_reached: "border-sky-400/25 bg-sky-400/10 text-sky-300",
  completed: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
};

export function AdminCampaignStatusBadge({ status }: { status: CampaignStatusDb }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status]}`}>{campaignStatusLabels[status]}</span>;
}
