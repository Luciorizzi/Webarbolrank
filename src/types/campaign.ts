export type CampaignStatus = "fundraising" | "goal_reached" | "scheduled" | "completed";

export interface CampaignUpdate {
  id: string;
  campaignId: string;
  date: string;
  title: string;
  content: string;
}

export interface Campaign {
  id: string;
  slug: string;
  title: string;
  location: string;
  ngoName: string;
  goalAmount: number;
  raisedAmount: number;
  impactGoal: number;
  status: CampaignStatus;
  activityDate?: string;
  deliveryDate?: string;
  excerpt: string;
  description: string;
  publishedAt: string;
  updates: CampaignUpdate[];
  evidence: string[];
  isDemo: boolean;
}
