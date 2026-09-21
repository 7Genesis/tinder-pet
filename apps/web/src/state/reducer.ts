// Reducer puro que aplica as ações do aplicativo sobre o estado.
import { createInitialState } from '../data/mock';
import { canAdvance, upsertDecision, withMutualMatch } from '../domain/matching';
import type { Adopter, AppState, Direction, MatchStage, Pet, PetStatus, Role } from '../domain/types';

export type Action =
  | { type: 'login'; role: Role; userId: string }
  | { type: 'logout' }
  | { type: 'swipeAdopter'; adopterId: string; petId: string; direction: Direction; now: number }
  | { type: 'swipeOng'; adopterId: string; petId: string; direction: Direction; now: number }
  | { type: 'sendMessage'; matchId: string; from: Role; text: string; now: number }
  | { type: 'setStage'; matchId: string; stage: MatchStage }
  | { type: 'addPet'; pet: Pet }
  | { type: 'saveAdopter'; adopter: Adopter }
  | { type: 'reset' };

// Status do pet que corresponde a cada estado do processo, quando há mudança.
const PET_STATUS_BY_STAGE: Partial<Record<MatchStage, PetStatus>> = {
  aprovado_para_adocao: 'em_processo',
  adotado: 'adotado',
  desistiu: 'disponivel',
};

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'login':
      return { ...state, session: { role: action.role, userId: action.userId } };

    case 'logout':
      return { ...state, session: null };

    case 'swipeAdopter': {
      const pet = state.pets.find((p) => p.id === action.petId);
      if (!pet) return state;
      const adopterDecisions = upsertDecision(state.adopterDecisions, {
        adopterId: action.adopterId,
        petId: action.petId,
        direction: action.direction,
        at: action.now,
      });
      const matches = withMutualMatch(state.matches, adopterDecisions, state.ongDecisions, pet, action.adopterId, action.now);
      return { ...state, adopterDecisions, matches };
    }

    case 'swipeOng': {
      const pet = state.pets.find((p) => p.id === action.petId);
      if (!pet) return state;
      const ongDecisions = upsertDecision(state.ongDecisions, {
        adopterId: action.adopterId,
        petId: action.petId,
        direction: action.direction,
        at: action.now,
      });
      const matches = withMutualMatch(state.matches, state.adopterDecisions, ongDecisions, pet, action.adopterId, action.now);
      return { ...state, ongDecisions, matches };
    }

    case 'sendMessage': {
      const text = action.text.trim();
      if (!text) return state;
      const message = { id: `msg-${state.messages.length + 1}`, matchId: action.matchId, from: action.from, text, at: action.now };
      return { ...state, messages: [...state.messages, message] };
    }

    case 'setStage': {
      const match = state.matches.find((m) => m.id === action.matchId);
      if (!match || !canAdvance(match.stage, action.stage)) return state;
      const pet = state.pets.find((p) => p.id === match.petId);
      if (!pet) return state;
      // Um pet só pode ter um processo ativo por vez.
      if (action.stage === 'aprovado_para_adocao' && pet.status !== 'disponivel') return state;
      const nextStatus = PET_STATUS_BY_STAGE[action.stage];
      return {
        ...state,
        matches: state.matches.map((m) => (m.id === match.id ? { ...m, stage: action.stage } : m)),
        pets: nextStatus ? state.pets.map((p) => (p.id === pet.id ? { ...p, status: nextStatus } : p)) : state.pets,
      };
    }

    case 'addPet':
      return { ...state, pets: [...state.pets, action.pet] };

    case 'saveAdopter': {
      const exists = state.adopters.some((a) => a.id === action.adopter.id);
      const adopters = exists
        ? state.adopters.map((a) => (a.id === action.adopter.id ? action.adopter : a))
        : [...state.adopters, action.adopter];
      return { ...state, adopters };
    }

    case 'reset':
      return createInitialState();
  }
}
