// Regras de requisitos duros e pontuação de compatibilidade entre pet e adotante.
import type { Adopter, Pet } from './types';

const WEIGHTS = { species: 40, size: 30, temperament: 30 };

// Indica se o adotante atende os requisitos que a ONG definiu para o pet.
export function meetsRequirements(pet: Pet, adopter: Adopter): boolean {
  if (pet.requiresScreenedHome && !adopter.screenedHome) return false;
  if (pet.requiresYard && !adopter.hasYard) return false;
  return true;
}

// Uma lista vazia significa sem preferência e conta como combinação.
function matches<T>(preferred: T[], value: T): boolean {
  return preferred.length === 0 || preferred.includes(value);
}

// Calcula a pontuação de 0 a 100 e os motivos exibidos no card.
export function compatibility(pet: Pet, adopter: Adopter): { score: number; reasons: string[] } {
  const { preferences } = adopter;
  const reasons: string[] = [];
  let score = 0;

  if (matches(preferences.species, pet.species)) {
    score += WEIGHTS.species;
    reasons.push('Espécie combina');
  }
  if (matches(preferences.sizes, pet.size)) {
    score += WEIGHTS.size;
    reasons.push('Porte combina');
  }
  if (matches(preferences.temperaments, pet.temperament)) {
    score += WEIGHTS.temperament;
    reasons.push('Temperamento combina');
  }
  if (pet.requiresScreenedHome && adopter.screenedHome) reasons.push('Casa telada');

  return { score, reasons };
}
