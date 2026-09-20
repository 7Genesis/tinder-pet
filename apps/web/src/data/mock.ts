// Estado inicial com ONGs, pets, adotantes, decisões e uma conversa de exemplo.
import type { AppState } from '../domain/types';

const BASE = Date.UTC(2026, 8, 20, 12, 0, 0);
const MINUTE = 60 * 1000;

export function createInitialState(): AppState {
  return {
    ongs: [
      { id: 'ong1', name: 'Patas do Bem', city: 'Campinas' },
      { id: 'ong2', name: 'Lar dos Bichos', city: 'São Paulo' },
    ],
    pets: [
      { id: 'p1', ongId: 'ong1', name: 'Thor', species: 'cao', size: 'medio', ageYears: 2, temperament: 'brincalhao', description: 'Adora correr e brincar de bola. Vacinado e castrado.', requiresScreenedHome: false, requiresYard: false, status: 'disponivel' },
      { id: 'p2', ongId: 'ong1', name: 'Mia', species: 'gato', size: 'pequeno', ageYears: 1, temperament: 'calmo', description: 'Gata tranquila, acostumada com apartamento.', requiresScreenedHome: true, requiresYard: false, status: 'disponivel' },
      { id: 'p3', ongId: 'ong2', name: 'Bob', species: 'cao', size: 'grande', ageYears: 4, temperament: 'calmo', description: 'Cachorro grande e dócil, precisa de espaço.', requiresScreenedHome: false, requiresYard: true, status: 'disponivel' },
      { id: 'p4', ongId: 'ong2', name: 'Luna', species: 'gato', size: 'medio', ageYears: 3, temperament: 'independente', description: 'Gata independente e carinhosa nas horas certas.', requiresScreenedHome: true, requiresYard: false, status: 'disponivel' },
      { id: 'p5', ongId: 'ong1', name: 'Nina', species: 'cao', size: 'pequeno', ageYears: 5, temperament: 'calmo', description: 'Cadelinha idosa e muito companheira.', requiresScreenedHome: false, requiresYard: false, status: 'disponivel' },
      { id: 'p6', ongId: 'ong2', name: 'Simba', species: 'gato', size: 'pequeno', ageYears: 1, temperament: 'brincalhao', description: 'Filhote cheio de energia.', requiresScreenedHome: true, requiresYard: false, status: 'disponivel' },
    ],
    adopters: [
      { id: 'a1', name: 'Marina', age: 29, city: 'Campinas', housing: 'apartamento', screenedHome: true, hasYard: false, otherPets: false, description: 'Trabalho em casa e tenho tempo para dedicar a um companheiro.', preferences: { species: ['cao'], sizes: ['medio', 'grande'], temperaments: ['brincalhao'] } },
      { id: 'a2', name: 'Carlos', age: 41, city: 'Campinas', housing: 'casa', screenedHome: false, hasYard: true, otherPets: false, description: 'Família com quintal grande e crianças maiores.', preferences: { species: ['cao'], sizes: ['medio', 'grande'], temperaments: [] } },
      { id: 'a3', name: 'Julia', age: 34, city: 'Valinhos', housing: 'apartamento', screenedHome: true, hasYard: false, otherPets: false, description: 'Amo gatos e já tive dois.', preferences: { species: ['gato'], sizes: [], temperaments: ['calmo'] } },
      { id: 'a4', name: 'Rafael', age: 27, city: 'São Paulo', housing: 'casa', screenedHome: true, hasYard: true, otherPets: true, description: 'Já tenho um gato e quero um segundo.', preferences: { species: ['gato'], sizes: [], temperaments: [] } },
    ],
    adopterDecisions: [
      { adopterId: 'a2', petId: 'p1', direction: 'right', at: BASE - 30 * MINUTE },
      { adopterId: 'a3', petId: 'p1', direction: 'right', at: BASE - 25 * MINUTE },
      { adopterId: 'a3', petId: 'p2', direction: 'right', at: BASE - 20 * MINUTE },
      { adopterId: 'a4', petId: 'p4', direction: 'right', at: BASE - 15 * MINUTE },
    ],
    ongDecisions: [{ adopterId: 'a3', petId: 'p2', direction: 'right', at: BASE - 10 * MINUTE }],
    matches: [
      { id: 'match-a3-p2', adopterId: 'a3', petId: 'p2', ongId: 'ong1', stage: 'conversa_previa', createdAt: BASE - 10 * MINUTE },
    ],
    messages: [
      { id: 'msg-1', matchId: 'match-a3-p2', from: 'ong', text: 'Oi, Julia! Vamos conversar sobre a Mia?', at: BASE - 9 * MINUTE },
      { id: 'msg-2', matchId: 'match-a3-p2', from: 'adopter', text: 'Oi! Vamos sim, obrigada por avaliar meu perfil.', at: BASE - 8 * MINUTE },
    ],
    session: null,
  };
}
