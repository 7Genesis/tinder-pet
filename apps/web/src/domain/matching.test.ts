import {
  REAPPEAR_MS,
  adopterFeed,
  canAdvance,
  isSuppressed,
  matchIdFor,
  ongQueue,
  upsertDecision,
  withMutualMatch,
} from './matching';
import { createInitialState } from '../data/mock';
import type { Decision } from './types';

const state = createInitialState();
const thor = state.pets.find((p) => p.id === 'p1')!;
const marina = state.adopters.find((a) => a.id === 'a1')!;
const NOW = Date.UTC(2026, 8, 20, 15);

const right = (adopterId: string, petId: string, at = NOW): Decision => ({ adopterId, petId, direction: 'right', at });
const left = (adopterId: string, petId: string, at = NOW): Decision => ({ adopterId, petId, direction: 'left', at });

describe('isSuppressed', () => {
  it('não suprime quando não há decisão', () => {
    expect(isSuppressed(undefined, NOW)).toBe(false);
  });

  it('suprime curtida para sempre', () => {
    expect(isSuppressed(right('a1', 'p1', NOW - 400 * 24 * 3600 * 1000), NOW)).toBe(true);
  });

  it('suprime recusa por 30 dias e libera depois', () => {
    expect(isSuppressed(left('a1', 'p1', NOW - REAPPEAR_MS + 1), NOW)).toBe(true);
    expect(isSuppressed(left('a1', 'p1', NOW - REAPPEAR_MS), NOW)).toBe(false);
  });
});

describe('upsertDecision', () => {
  it('substitui a decisão do mesmo par', () => {
    const result = upsertDecision([left('a1', 'p1', 1)], right('a1', 'p1', 2));
    expect(result).toHaveLength(1);
    expect(result[0].direction).toBe('right');
  });
});

describe('withMutualMatch', () => {
  it('cria match quando os dois lados curtem', () => {
    const result = withMutualMatch([], [right('a1', 'p1')], [right('a1', 'p1')], thor, 'a1', NOW);
    expect(result).toEqual([
      { id: matchIdFor('a1', 'p1'), adopterId: 'a1', petId: 'p1', ongId: 'ong1', stage: 'conversa_previa', createdAt: NOW },
    ]);
  });

  it('não cria match se um dos lados recusou', () => {
    expect(withMutualMatch([], [right('a1', 'p1')], [left('a1', 'p1')], thor, 'a1', NOW)).toEqual([]);
    expect(withMutualMatch([], [left('a1', 'p1')], [right('a1', 'p1')], thor, 'a1', NOW)).toEqual([]);
  });

  it('não cria match se falta uma das decisões', () => {
    expect(withMutualMatch([], [right('a1', 'p1')], [], thor, 'a1', NOW)).toEqual([]);
  });

  it('não duplica um match existente', () => {
    const first = withMutualMatch([], [right('a1', 'p1')], [right('a1', 'p1')], thor, 'a1', NOW);
    const second = withMutualMatch(first, [right('a1', 'p1')], [right('a1', 'p1')], thor, 'a1', NOW + 1);
    expect(second).toHaveLength(1);
  });
});

describe('adopterFeed', () => {
  it('ordena por compatibilidade e oculta pets que exigem o que o adotante não tem', () => {
    const feed = adopterFeed(state.pets, marina, [], NOW).map((p) => p.id);
    expect(feed[0]).toBe('p1');
    expect(feed).not.toContain('p3');
  });

  it('remove pets já decididos e devolve recusas após 30 dias', () => {
    const recente = adopterFeed(state.pets, marina, [left('a1', 'p1', NOW - 1000)], NOW).map((p) => p.id);
    expect(recente).not.toContain('p1');
    const antiga = adopterFeed(state.pets, marina, [left('a1', 'p1', NOW - REAPPEAR_MS)], NOW).map((p) => p.id);
    expect(antiga).toContain('p1');
  });

  it('não mostra pets que não estão disponíveis', () => {
    const pets = state.pets.map((p) => (p.id === 'p1' ? { ...p, status: 'em_processo' as const } : p));
    expect(adopterFeed(pets, marina, [], NOW).map((p) => p.id)).not.toContain('p1');
  });
});

describe('ongQueue', () => {
  it('lista só quem curtiu pets da ONG e ainda não foi decidido', () => {
    const queue = ongQueue(state.adopterDecisions, [], state.pets, 'ong1', NOW);
    expect(queue.map((q) => `${q.adopterId}:${q.petId}`)).toEqual(['a2:p1', 'a3:p1', 'a3:p2']);
  });

  it('exclui pares já decididos pela ONG', () => {
    const queue = ongQueue(state.adopterDecisions, state.ongDecisions, state.pets, 'ong1', NOW);
    expect(queue.map((q) => `${q.adopterId}:${q.petId}`)).toEqual(['a2:p1', 'a3:p1']);
  });

  it('ignora curtidas em pets de outra ONG', () => {
    const queue = ongQueue(state.adopterDecisions, [], state.pets, 'ong2', NOW);
    expect(queue.map((q) => q.petId)).toEqual(['p4']);
  });
});

describe('canAdvance', () => {
  it('permite apenas as transições do processo', () => {
    expect(canAdvance('conversa_previa', 'aprovado_para_adocao')).toBe(true);
    expect(canAdvance('conversa_previa', 'adotado')).toBe(false);
    expect(canAdvance('aprovado_para_adocao', 'adotado')).toBe(true);
    expect(canAdvance('aprovado_para_adocao', 'desistiu')).toBe(true);
    expect(canAdvance('adotado', 'desistiu')).toBe(false);
    expect(canAdvance('desistiu', 'conversa_previa')).toBe(false);
  });
});
