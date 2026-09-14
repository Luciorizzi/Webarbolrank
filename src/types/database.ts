export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
export type DonationStatus = "pending" | "approved" | "rejected" | "refunded";
export type CampaignStatusDb = "fundraising" | "goal_reached" | "scheduled" | "completed";
export type EvidenceType = "photo" | "receipt" | "document" | "external_link";

export interface Database {
  public: {
    Tables: {
      admin_users: { Row: { user_id: string; created_at: string }; Insert: { user_id: string; created_at?: string }; Update: never; Relationships: [] };
      categories: { Row: { id: string; name: string; slug: string; created_at: string }; Insert: { id?: string; name: string; slug: string; created_at?: string }; Update: { name?: string; slug?: string }; Relationships: [] };
      participants: { Row: { id: string; name: string; slug: string; avatar_url: string | null; bio: string | null; category_id: string | null; verified: boolean; active: boolean; created_at: string; updated_at: string }; Insert: { id?: string; name: string; slug: string; avatar_url?: string | null; bio?: string | null; category_id?: string | null; verified?: boolean; active?: boolean }; Update: { name?: string; slug?: string; avatar_url?: string | null; bio?: string | null; category_id?: string | null; verified?: boolean; active?: boolean }; Relationships: [] };
      donors: { Row: { id: string; display_name: string | null; created_at: string }; Insert: { id?: string; display_name?: string | null }; Update: { display_name?: string | null }; Relationships: [] };
      donations: { Row: { id: string; donor_id: string | null; participant_id: string | null; anonymous: boolean; impact_units: number; amount: number; status: DonationStatus; payment_provider: string | null; payment_reference: string | null; preference_id: string | null; created_at: string; updated_at: string }; Insert: { id?: string; donor_id?: string | null; participant_id?: string | null; anonymous?: boolean; impact_units: number; amount: number; status?: DonationStatus; payment_provider?: string | null; payment_reference?: string | null; preference_id?: string | null }; Update: { status?: DonationStatus; payment_provider?: string | null; payment_reference?: string | null; preference_id?: string | null }; Relationships: [] };
      campaigns: { Row: { id: string; slug: string; title: string; location: string | null; ngo_name: string | null; goal_amount: number | null; raised_amount: number | null; impact_goal: number | null; status: CampaignStatusDb; activity_date: string | null; delivery_date: string | null; excerpt: string | null; description: string | null; cover_image_url: string | null; published_at: string | null; created_at: string; updated_at: string }; Insert: { id?: string; slug: string; title: string; status: CampaignStatusDb; location?: string | null; ngo_name?: string | null; goal_amount?: number | null; raised_amount?: number | null; impact_goal?: number | null; activity_date?: string | null; delivery_date?: string | null; excerpt?: string | null; description?: string | null; cover_image_url?: string | null; published_at?: string | null }; Update: { slug?: string; title?: string; status?: CampaignStatusDb; location?: string | null; ngo_name?: string | null; goal_amount?: number | null; raised_amount?: number | null; impact_goal?: number | null; activity_date?: string | null; delivery_date?: string | null; excerpt?: string | null; description?: string | null; cover_image_url?: string | null; published_at?: string | null }; Relationships: [] };
      campaign_updates: { Row: { id: string; campaign_id: string; title: string; content: string | null; event_date: string; created_at: string }; Insert: { id?: string; campaign_id: string; title: string; content?: string | null; event_date: string }; Update: { campaign_id?: string; title?: string; content?: string | null; event_date?: string }; Relationships: [] };
      campaign_evidence: { Row: { id: string; campaign_id: string; type: EvidenceType; label: string; url: string | null; evidence_date: string | null; created_at: string }; Insert: { id?: string; campaign_id: string; type: EvidenceType; label: string; url?: string | null; evidence_date?: string | null }; Update: { campaign_id?: string; type?: EvidenceType; label?: string; url?: string | null; evidence_date?: string | null }; Relationships: [] };
    };
    Views: Record<string, never>;
    Functions: {
      get_ranking: { Args: { ranking_period?: string }; Returns: { participant_id: string; name: string; slug: string; avatar_url: string | null; bio: string | null; category_slug: string | null; verified: boolean; total_impact_units: number; donor_count: number; recent_impact_units: number; rank_position: number }[] };
      get_recent_donations: { Args: { result_limit?: number; filter_participant_slug?: string | null }; Returns: { id: string; donor_name: string | null; anonymous: boolean; participant_slug: string | null; impact_units: number; amount: number; created_at: string }[] };
      get_top_donors: { Args: { result_limit?: number; filter_participant_slug?: string | null }; Returns: { donor_name: string; impact_units: number }[] };
    };
    Enums: { donation_status: DonationStatus; campaign_status: CampaignStatusDb; evidence_type: EvidenceType };
    CompositeTypes: Record<string, never>;
  };
}
