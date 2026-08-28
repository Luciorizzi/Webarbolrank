export type RankingPeriod = "historical" | "month" | "today";
export type ParticipantCategory = "Streamer" | "Creador" | "Comunidad";

export interface Participant {
  id: string;
  slug: string;
  name: string;
  initials: string;
  category: ParticipantCategory;
  verified: boolean;
  description: string;
}

export interface RankingEntry extends Participant {
  position: number;
  treesFunded: number;
  contributors: number;
  recentTrees: number;
}

export type RankingParticipant = RankingEntry;
