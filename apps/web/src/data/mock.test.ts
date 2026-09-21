import { createInitialState } from './mock';

// Garante que os dados fictícios referenciam apenas entidades existentes.
describe('createInitialState', () => {
  const state = createInitialState();
  const ongIds = new Set(state.ongs.map((o) => o.id));
  const petIds = new Set(state.pets.map((p) => p.id));
  const adopterIds = new Set(state.adopters.map((a) => a.id));

  it('liga cada pet a uma ONG existente', () => {
    expect(state.pets.every((p) => ongIds.has(p.ongId))).toBe(true);
  });

  it('liga cada decisão a adotante e pet existentes', () => {
    const all = [...state.adopterDecisions, ...state.ongDecisions];
    expect(all.every((d) => adopterIds.has(d.adopterId) && petIds.has(d.petId))).toBe(true);
  });

  it('liga cada match e mensagem a entidades existentes', () => {
    const matchIds = new Set(state.matches.map((m) => m.id));
    expect(state.matches.every((m) => petIds.has(m.petId) && adopterIds.has(m.adopterId))).toBe(true);
    expect(state.messages.every((m) => matchIds.has(m.matchId))).toBe(true);
  });

  it('começa sem sessão', () => {
    expect(state.session).toBeNull();
  });
});
