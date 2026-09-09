import { getRanking } from "./ranking";
export async function getParticipants() { return getRanking("historical"); }
export async function getParticipantBySlug(slug: string) { return (await getParticipants()).find((participant) => participant.slug === slug) ?? null; }
