import { reducer } from './reducer';
import { createInitialState } from '../data/mock';

const NOW = Date.UTC(2026, 8, 20, 15);

describe('reducer', () => {
  it('faz login e logout', () => {
    const logged = reducer(createInitialState(), { type: 'login', role: 'adopter', userId: 'a1' });
    expect(logged.session).toEqual({ role: 'adopter', userId: 'a1' });
    expect(reducer(logged, { type: 'logout' }).session).toBeNull();
  });

  it('registra a curtida do adotante sem criar match sozinha', () => {
    const next = reducer(createInitialState(), { type: 'swipeAdopter', adopterId: 'a1', petId: 'p1', direction: 'right', now: NOW });
    expect(next.adopterDecisions.some((d) => d.adopterId === 'a1' && d.petId === 'p1')).toBe(true);
    expect(next.matches).toHaveLength(1);
  });

  it('cria match quando a ONG também curte', () => {
    let state = reducer(createInitialState(), { type: 'swipeAdopter', adopterId: 'a1', petId: 'p1', direction: 'right', now: NOW });
    state = reducer(state, { type: 'swipeOng', adopterId: 'a1', petId: 'p1', direction: 'right', now: NOW + 1 });
    expect(state.matches.map((m) => m.id)).toContain('match-a1-p1');
  });

  it('não cria match quando a ONG recusa', () => {
    let state = reducer(createInitialState(), { type: 'swipeAdopter', adopterId: 'a1', petId: 'p1', direction: 'right', now: NOW });
    state = reducer(state, { type: 'swipeOng', adopterId: 'a1', petId: 'p1', direction: 'left', now: NOW + 1 });
    expect(state.matches.map((m) => m.id)).not.toContain('match-a1-p1');
  });

  it('ignora swipe de pet inexistente', () => {
    const state = createInitialState();
    expect(reducer(state, { type: 'swipeAdopter', adopterId: 'a1', petId: 'nao-existe', direction: 'right', now: NOW })).toBe(state);
  });

  it('envia mensagem e ignora texto vazio', () => {
    const state = createInitialState();
    const sent = reducer(state, { type: 'sendMessage', matchId: 'match-a3-p2', from: 'ong', text: '  Olá  ', now: NOW });
    expect(sent.messages.at(-1)).toMatchObject({ matchId: 'match-a3-p2', from: 'ong', text: 'Olá', at: NOW });
    expect(reducer(state, { type: 'sendMessage', matchId: 'match-a3-p2', from: 'ong', text: '   ', now: NOW })).toBe(state);
  });

  it('aprova para adoção e marca o pet como em processo', () => {
    const next = reducer(createInitialState(), { type: 'setStage', matchId: 'match-a3-p2', stage: 'aprovado_para_adocao' });
    expect(next.matches[0].stage).toBe('aprovado_para_adocao');
    expect(next.pets.find((p) => p.id === 'p2')!.status).toBe('em_processo');
  });

  it('marca o pet como adotado ao concluir', () => {
    let state = reducer(createInitialState(), { type: 'setStage', matchId: 'match-a3-p2', stage: 'aprovado_para_adocao' });
    state = reducer(state, { type: 'setStage', matchId: 'match-a3-p2', stage: 'adotado' });
    expect(state.pets.find((p) => p.id === 'p2')!.status).toBe('adotado');
  });

  it('devolve o pet a disponível quando o adotante desiste', () => {
    let state = reducer(createInitialState(), { type: 'setStage', matchId: 'match-a3-p2', stage: 'aprovado_para_adocao' });
    state = reducer(state, { type: 'setStage', matchId: 'match-a3-p2', stage: 'desistiu' });
    expect(state.pets.find((p) => p.id === 'p2')!.status).toBe('disponivel');
  });

  it('rejeita transição inválida e segundo processo ativo do mesmo pet', () => {
    const state = createInitialState();
    expect(reducer(state, { type: 'setStage', matchId: 'match-a3-p2', stage: 'adotado' })).toBe(state);

    let second = reducer(state, { type: 'swipeAdopter', adopterId: 'a1', petId: 'p2', direction: 'right', now: NOW });
    second = reducer(second, { type: 'swipeOng', adopterId: 'a1', petId: 'p2', direction: 'right', now: NOW + 1 });
    second = reducer(second, { type: 'setStage', matchId: 'match-a3-p2', stage: 'aprovado_para_adocao' });
    const blocked = reducer(second, { type: 'setStage', matchId: 'match-a1-p2', stage: 'aprovado_para_adocao' });
    expect(blocked).toBe(second);
  });

  it('adiciona pet disponível e salva adotante novo ou existente', () => {
    const pet = { id: 'p7', ongId: 'ong1', name: 'Rex', species: 'cao' as const, size: 'medio' as const, ageYears: 3, temperament: 'calmo' as const, description: 'Dócil.', requiresScreenedHome: false, requiresYard: false, status: 'disponivel' as const };
    expect(reducer(createInitialState(), { type: 'addPet', pet }).pets.at(-1)).toEqual(pet);

    const base = createInitialState();
    const edited = reducer(base, { type: 'saveAdopter', adopter: { ...base.adopters[0], name: 'Marina Souza' } });
    expect(edited.adopters).toHaveLength(base.adopters.length);
    expect(edited.adopters[0].name).toBe('Marina Souza');
    const created = reducer(base, { type: 'saveAdopter', adopter: { ...base.adopters[0], id: 'a9' } });
    expect(created.adopters).toHaveLength(base.adopters.length + 1);
  });

  it('restaura os dados iniciais no reset', () => {
    const changed = reducer(createInitialState(), { type: 'login', role: 'ong', userId: 'ong1' });
    expect(reducer(changed, { type: 'reset' })).toEqual(createInitialState());
  });
});
