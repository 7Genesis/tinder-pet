// Regras de decisão por swipe, match duplo, fila da ONG, feed do adotante e estados do processo.
import { compatibility, meetsRequirements } from './compatibility';
import type { Adopter, Decision, Match, MatchStage, Pet } from './types';

// Tempo após o qual uma recusa deixa de esconder o card: 30 dias.
export const REAPPEAR_MS = 30 * 24 * 60 * 60 * 1000;

// Procura a decisão registrada para o par adotante e pet.
export function findDecision(list: Decision[], adopterId: string, petId: string): Decision | undefined {
  return list.find((d) => d.adopterId === adopterId && d.petId === petId);
}

// Uma curtida esconde o card para sempre e uma recusa esconde por 30 dias.
export function isSuppressed(decision: Decision | undefined, now: number): boolean {
  if (!decision) return false;
  if (decision.direction === 'right') return true;
  return now - decision.at < REAPPEAR_MS;
}

// Grava a decisão substituindo a anterior do mesmo par.
export function upsertDecision(list: Decision[], next: Decision): Decision[] {
  return [...list.filter((d) => !(d.adopterId === next.adopterId && d.petId === next.petId)), next];
}

// Identificador determinístico do match, que impede duplicidade.
export function matchIdFor(adopterId: string, petId: string): string {
  return `match-${adopterId}-${petId}`;
}

// Acrescenta o match quando adotante e ONG curtiram o mesmo par.
export function withMutualMatch(
  matches: Match[],
  adopterDecisions: Decision[],
  ongDecisions: Decision[],
  pet: Pet,
  adopterId: string,
  now: number,
): Match[] {
  const fromAdopter = findDecision(adopterDecisions, adopterId, pet.id);
  const fromOng = findDecision(ongDecisions, adopterId, pet.id);
  const id = matchIdFor(adopterId, pet.id);
  const mutual = fromAdopter?.direction === 'right' && fromOng?.direction === 'right';
  if (!mutual || matches.some((m) => m.id === id)) return matches;
  return [
    ...matches,
    { id, adopterId, petId: pet.id, ongId: pet.ongId, stage: 'conversa_previa', createdAt: now },
  ];
}

// Pets disponíveis que o adotante pode ver, ordenados por compatibilidade.
export function adopterFeed(pets: Pet[], adopter: Adopter, adopterDecisions: Decision[], now: number): Pet[] {
  return pets
    .filter(
      (pet) =>
        pet.status === 'disponivel' &&
        meetsRequirements(pet, adopter) &&
        !isSuppressed(findDecision(adopterDecisions, adopter.id, pet.id), now),
    )
    .sort((a, b) => compatibility(b, adopter).score - compatibility(a, adopter).score);
}

// Adotantes que curtiram um pet da ONG e ainda aguardam a decisão dela.
export function ongQueue(
  adopterDecisions: Decision[],
  ongDecisions: Decision[],
  pets: Pet[],
  ongId: string,
  now: number,
): { adopterId: string; petId: string }[] {
  const ownPetIds = new Set(pets.filter((p) => p.ongId === ongId && p.status === 'disponivel').map((p) => p.id));
  return adopterDecisions
    .filter(
      (d) =>
        d.direction === 'right' &&
        ownPetIds.has(d.petId) &&
        !isSuppressed(findDecision(ongDecisions, d.adopterId, d.petId), now),
    )
    .map((d) => ({ adopterId: d.adopterId, petId: d.petId }));
}

const TRANSITIONS: Record<MatchStage, MatchStage[]> = {
  conversa_previa: ['aprovado_para_adocao', 'desistiu'],
  aprovado_para_adocao: ['adotado', 'desistiu'],
  adotado: [],
  desistiu: [],
};

// Indica se o processo pode passar de um estado para outro.
export function canAdvance(from: MatchStage, to: MatchStage): boolean {
  return TRANSITIONS[from].includes(to);
}
