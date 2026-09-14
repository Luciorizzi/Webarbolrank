import "server-only";
import { getAdminDb } from "./shared";

export async function getDashboardData() {
  const db = await getAdminDb();
  const [donationsResult, participantsResult, campaignsResult] = await Promise.all([
    db.from("donations").select("id,donor_id,participant_id,anonymous,impact_units,amount,status,payment_reference,created_at").order("created_at", { ascending: false }),
    db.from("participants").select("id,name,active"),
    db.from("campaigns").select("id,published_at,status"),
  ]);
  if (donationsResult.error || participantsResult.error || campaignsResult.error) throw new Error("No se pudo cargar el dashboard.");
  const donations = donationsResult.data ?? [];
  const approved = donations.filter((d) => d.status === "approved");
  const participantNames = new Map((participantsResult.data ?? []).map((p) => [p.id, p.name]));
  const donorIds = [...new Set(donations.slice(0, 10).map((d) => d.donor_id).filter(Boolean))] as string[];
  const { data: donors } = donorIds.length ? await db.from("donors").select("id,display_name").in("id", donorIds) : { data: [] };
  const donorNames = new Map((donors ?? []).map((d) => [d.id, d.display_name]));
  return {
    metrics: {
      approvedKg: approved.reduce((sum, d) => sum + d.impact_units, 0),
      approvedAmount: approved.reduce((sum, d) => sum + d.amount, 0),
      approved: approved.length,
      pending: donations.filter((d) => d.status === "pending").length,
      rejected: donations.filter((d) => d.status === "rejected").length,
      refunded: donations.filter((d) => d.status === "refunded").length,
      activeParticipants: (participantsResult.data ?? []).filter((p) => p.active).length,
      activeCampaigns: (campaignsResult.data ?? []).filter((c) => c.published_at && c.status !== "completed").length,
    },
    recent: donations.slice(0, 10).map((d) => ({ ...d, participant: d.participant_id ? participantNames.get(d.participant_id) ?? "—" : "General", donor: d.anonymous ? "Anónimo" : (d.donor_id ? donorNames.get(d.donor_id) : null) ?? "—" })),
  };
}

