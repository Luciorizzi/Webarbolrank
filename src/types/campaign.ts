export type CampaignStatus = "fundraising" | "goal_reached" | "scheduled" | "completed";

export interface CampaignUpdate {
  id: string;
  campaignId: string;
  date: string;
  title: string;
  content: string;
}

export interface CampaignEvidence {
  id: string;
  type: "photo" | "receipt" | "document" | "external_link";
  label: string;
  url?: string;
  date?: string;
  images: CampaignEvidenceImage[];
}

export interface CampaignEvidenceImage {
  id: string;
  url: string;
  sortOrder: number;
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
  coverImageUrl?: string;
  publishedAt: string;
  updates: CampaignUpdate[];
  evidence: CampaignEvidence[];
  isDemo: boolean;
}
