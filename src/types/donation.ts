export interface Donor {
  id: string;
  name: string | null;
  anonymous: boolean;
}

export interface Donation {
  id: string;
  donorName: string | null;
  anonymous: boolean;
  participantSlug: string | null;
  impactUnits: number;
  amount: number;
  createdAt: string;
}

export interface DonorRankingEntry {
  donorName: string;
  impactUnits: number;
}
