import type { RankingParticipant } from "@/types/ranking";

export const rankingParticipants: RankingParticipant[] = [
  { id: "spreen", slug: "spreen", name: "Spreen", initials: "SP", category: "Streamer", verified: true, description: "Una de las comunidades de streaming más grandes de Argentina, compitiendo para transformar alcance en impacto.", position: 1, treesFunded: 12_482, contributors: 6_104, recentTrees: 421 },
  { id: "davo", slug: "davo", name: "Davo Xeneize", initials: "DX", category: "Creador", verified: true, description: "Comunidad de fútbol y streaming unida para escalar posiciones árbol por árbol.", position: 2, treesFunded: 12_351, contributors: 5_821, recentTrees: 382 },
  { id: "coscu", slug: "coscu", name: "Coscu", initials: "CO", category: "Streamer", verified: true, description: "Una comunidad pionera del streaming argentino que lleva su competencia fuera de la pantalla.", position: 3, treesFunded: 10_221, contributors: 4_739, recentTrees: 295 },
  { id: "momo", slug: "momo", name: "Momo", initials: "MO", category: "Creador", verified: true, description: "Audiencia, entretenimiento y compromiso colectivo detrás de una meta concreta.", position: 4, treesFunded: 8_904, contributors: 3_870, recentTrees: 214 },
  { id: "luquitas", slug: "luquitas-rodriguez", name: "Luquitas Rodríguez", initials: "LR", category: "Comunidad", verified: false, description: "Una comunidad creativa que convierte cada aporte en árboles y movimiento en el ranking.", position: 5, treesFunded: 7_610, contributors: 3_192, recentTrees: 188 },
];

export function findParticipantBySlug(slug: string) {
  return rankingParticipants.find((participant) => participant.slug === slug);
}
