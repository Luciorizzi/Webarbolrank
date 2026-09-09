import type { CampaignStatus } from "@/types/campaign";

const campaignStatusLabels: Record<CampaignStatus, string> = { fundraising: "En recaudación", goal_reached: "Meta cumplida", scheduled: "Entrega programada", completed: "Entrega realizada" };
const styles: Record<CampaignStatus, string> = { fundraising: "border-amber-400/25 bg-amber-400/10 text-amber-300", goal_reached: "border-sky-400/25 bg-sky-400/10 text-sky-300", scheduled: "border-violet-400/25 bg-violet-400/10 text-violet-300", completed: "border-amber-400/25 bg-amber-400/10 text-amber-300" };
export function CampaignStatusBadge({ status }: { status: CampaignStatus }) { return <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${styles[status]}`}>{campaignStatusLabels[status]}</span>; }
