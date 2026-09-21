// Tipos de domínio compartilhados por regras, estado e telas.

export type Species = 'cao' | 'gato';
export type Size = 'pequeno' | 'medio' | 'grande';
export type Temperament = 'calmo' | 'brincalhao' | 'independente';
export type PetStatus = 'disponivel' | 'em_processo' | 'adotado';
export type Direction = 'right' | 'left';
export type MatchStage = 'conversa_previa' | 'aprovado_para_adocao' | 'adotado' | 'desistiu';
export type Role = 'adopter' | 'ong';

export interface Ong {
  id: string;
  name: string;
  city: string;
}

export interface Pet {
  id: string;
  ongId: string;
  name: string;
  species: Species;
  size: Size;
  ageYears: number;
  temperament: Temperament;
  description: string;
  requiresScreenedHome: boolean;
  requiresYard: boolean;
  status: PetStatus;
}

export interface AdopterPreferences {
  species: Species[];
  sizes: Size[];
  temperaments: Temperament[];
}

export interface Adopter {
  id: string;
  name: string;
  age: number;
  city: string;
  housing: 'apartamento' | 'casa';
  screenedHome: boolean;
  hasYard: boolean;
  otherPets: boolean;
  description: string;
  preferences: AdopterPreferences;
}

// Decisão de swipe sobre o par adotante e pet, usada pelos dois lados.
export interface Decision {
  adopterId: string;
  petId: string;
  direction: Direction;
  at: number;
}

export interface Match {
  id: string;
  adopterId: string;
  petId: string;
  ongId: string;
  stage: MatchStage;
  createdAt: number;
}

export interface Message {
  id: string;
  matchId: string;
  from: Role;
  text: string;
  at: number;
}

// Sessão simulada: para a ONG, userId é o id da ONG.
export type Session = { role: Role; userId: string } | null;

export interface AppState {
  ongs: Ong[];
  pets: Pet[];
  adopters: Adopter[];
  adopterDecisions: Decision[];
  ongDecisions: Decision[];
  matches: Match[];
  messages: Message[];
  session: Session;
}
