# Protótipo Web Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar um protótipo web navegável do Tinder Pet, com dados fictícios, que demonstra o swipe do adotante, o swipe da ONG, o match duplo e o chat da conversa prévia, publicado no GitHub Pages.

**Architecture:** Aplicação React de página única em `apps/web`, sem backend. As regras de negócio (compatibilidade, match duplo, reaparecimento após 30 dias, estados do processo) ficam em funções puras testadas, consumidas por um reducer. O estado é persistido no `localStorage`. As telas só leem o estado e disparam ações, o que permite trocar o reducer por chamadas à API real depois.

**Tech Stack:** Vite, React, TypeScript, React Router (HashRouter), Vitest, Testing Library, vite-plugin-pwa, GitHub Actions e GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-20-tinder-pet-design.md`

## Global Constraints

1. TypeScript em modo estrito. Sem `any`.
2. Sem emojis em código, textos da interface, documentos e commits.
3. Sem travessões (caracteres em dash e en dash) em código, textos, documentos e commits.
4. Comentários explicam o que o trecho faz, em português, e nunca contêm conversa ou notas de tarefa. Toda função exportada e todo arquivo de componente tem um comentário curto de propósito.
5. Textos da interface em português do Brasil, com acentos.
6. Mensagens de commit em português, sem acentos, sem Co-Authored-By e sem menção a ferramentas de IA.
7. Não fazer `git push`. O push só acontece quando o usuário autorizar.
8. Prazo do requisito de recusa: card recusado (esquerda) some e volta ao feed após exatamente 30 dias.
9. O chat só existe para um match, e o match só nasce quando adotante e ONG deslizam para a direita no mesmo par adotante e pet.
10. Todos os comandos `npm` rodam dentro de `apps/web`.

## File Structure

```
apps/web/
  index.html
  vite.config.ts
  pwa-assets.config.ts
  public/icon.svg
  src/
    main.tsx                    ponto de entrada com HashRouter
    App.tsx                     rotas e proteção por papel
    styles.css                  estilos globais
    test/setup.ts               configuração do jest-dom
    test/render.tsx             helper para renderizar com provider e router
    domain/types.ts             tipos de domínio e AppState
    domain/labels.ts            rótulos em português
    domain/compatibility.ts     requisitos duros e pontuação
    domain/matching.ts          decisões, match duplo, fila da ONG, feed
    data/mock.ts                estado inicial com dados fictícios
    state/reducer.ts            reducer puro do aplicativo
    state/context.ts            contexto e hook useApp
    state/AppProvider.tsx       provider com persistência no localStorage
    hooks/useSwipe.ts           gesto de arrastar
    hooks/useNewMatch.ts        detecta match recém criado
    components/SwipeCard.tsx    card arrastável
    components/SwipeActions.tsx botões de esquerda e direita
    components/PetCard.tsx      card do pet
    components/PersonCard.tsx   card do adotante
    components/Detail.tsx       painel de detalhe
    components/MatchOverlay.tsx aviso de match
    components/Shell.tsx        cabeçalho e navegação
    screens/Login.tsx
    screens/AdopterFeed.tsx
    screens/OngFeed.tsx
    screens/Matches.tsx
    screens/Chat.tsx
    screens/ProfileForm.tsx
    screens/NewPet.tsx
```

---

### Task 1: Scaffold do projeto e ferramentas de teste

**Files:**
- Create: `apps/web/` (via Vite), `apps/web/src/test/setup.ts`, `apps/web/src/smoke.test.ts`
- Modify: `apps/web/vite.config.ts`, `apps/web/tsconfig.app.json`, `apps/web/package.json`
- Delete: `apps/web/.gitkeep`, `apps/web/src/App.css`, `apps/web/src/assets/`

**Interfaces:**
- Produces: comandos `npm run dev`, `npm run build`, `npm run lint`, `npm test` funcionando dentro de `apps/web`.

- [ ] **Step 1: Criar o projeto com o Vite**

```bash
cd "apps"
rm -rf web
npm create vite@latest web -- --template react-ts
cd web
npm install
npm install react-router-dom
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event vite-plugin-pwa @vite-pwa/assets-generator
```

Se o assistente do Vite perguntar algo, escolher React e TypeScript.

- [ ] **Step 2: Configurar Vite e Vitest**

Substituir `apps/web/vite.config.ts`:

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// A base vem da variável VITE_BASE para funcionar no GitHub Pages (subcaminho do repositório).
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
```

Criar `apps/web/src/test/setup.ts`:

```ts
// Adiciona os matchers do jest-dom ao Vitest.
import '@testing-library/jest-dom/vitest';
```

Em `apps/web/tsconfig.app.json`, dentro de `compilerOptions`, adicionar:

```json
"types": ["vite/client", "vitest/globals", "@testing-library/jest-dom"]
```

- [ ] **Step 3: Limpar o modelo do Vite**

```bash
rm -f .gitkeep src/App.css
rm -rf src/assets
```

Substituir `src/App.tsx` por:

```tsx
// Componente raiz provisório, substituído na tarefa de rotas.
export default function App() {
  return <h1>Tinder Pet</h1>;
}
```

Substituir `src/index.css` por um arquivo vazio e renomear para `src/styles.css`. Em `src/main.tsx`, trocar o import de `./index.css` por `./styles.css`.

- [ ] **Step 4: Escrever um teste de fumaça**

Criar `src/smoke.test.ts`:

```ts
// Confirma que o Vitest está executando com jsdom.
describe('ambiente de teste', () => {
  it('executa com jsdom', () => {
    expect(document.createElement('div')).toBeInstanceOf(HTMLElement);
  });
});
```

- [ ] **Step 5: Rodar tudo**

Run: `npm test -- --run && npm run lint && npm run build`
Expected: teste passa, lint sem erros, build conclui.

- [ ] **Step 6: Commit**

```bash
cd ../..
git add apps/web
git commit -m "Cria projeto web com Vite, React e Vitest"
```

---

### Task 2: Tipos de domínio, rótulos e dados fictícios

**Files:**
- Create: `apps/web/src/domain/types.ts`, `apps/web/src/domain/labels.ts`, `apps/web/src/data/mock.ts`
- Test: `apps/web/src/data/mock.test.ts`

**Interfaces:**
- Produces:
  - Tipos: `Species`, `Size`, `Temperament`, `PetStatus`, `Direction`, `MatchStage`, `Role`, `Ong`, `Pet`, `AdopterPreferences`, `Adopter`, `Decision`, `Match`, `Message`, `Session`, `AppState`
  - `createInitialState(): AppState`
  - Rótulos: `speciesLabel`, `sizeLabel`, `temperamentLabel`, `housingLabel`, `stageLabel` (todos `Record<..., string>`)

- [ ] **Step 1: Escrever o teste de integridade dos dados**

Criar `src/data/mock.test.ts`:

```ts
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
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- --run src/data/mock.test.ts`
Expected: FAIL, módulo `./mock` não encontrado.

- [ ] **Step 3: Criar os tipos**

Criar `src/domain/types.ts`:

```ts
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
```

Criar `src/domain/labels.ts`:

```ts
// Rótulos em português para exibir valores de domínio na interface.
import type { MatchStage, Size, Species, Temperament } from './types';

export const speciesLabel: Record<Species, string> = { cao: 'Cão', gato: 'Gato' };

export const sizeLabel: Record<Size, string> = {
  pequeno: 'Pequeno',
  medio: 'Médio',
  grande: 'Grande',
};

export const temperamentLabel: Record<Temperament, string> = {
  calmo: 'Calmo',
  brincalhao: 'Brincalhão',
  independente: 'Independente',
};

export const housingLabel: Record<'apartamento' | 'casa', string> = {
  apartamento: 'Apartamento',
  casa: 'Casa',
};

export const stageLabel: Record<MatchStage, string> = {
  conversa_previa: 'Conversa prévia',
  aprovado_para_adocao: 'Aprovado para adoção',
  adotado: 'Adotado',
  desistiu: 'Desistiu',
};
```

- [ ] **Step 4: Criar os dados fictícios**

Criar `src/data/mock.ts`:

```ts
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
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npm test -- --run src/data/mock.test.ts && npx tsc -b`
Expected: PASS e sem erros de tipo.

- [ ] **Step 6: Commit**

```bash
git add src
git commit -m "Adiciona tipos de dominio, rotulos e dados ficticios"
```

---

### Task 3: Compatibilidade e requisitos

**Files:**
- Create: `apps/web/src/domain/compatibility.ts`
- Test: `apps/web/src/domain/compatibility.test.ts`

**Interfaces:**
- Consumes: `Pet`, `Adopter` de `./types`.
- Produces:
  - `meetsRequirements(pet: Pet, adopter: Adopter): boolean`
  - `compatibility(pet: Pet, adopter: Adopter): { score: number; reasons: string[] }`

Pesos: espécie 40, porte 30, temperamento 30. Lista de preferência vazia significa sem preferência e vale pontos cheios.

- [ ] **Step 1: Escrever os testes**

Criar `src/domain/compatibility.test.ts`:

```ts
import { compatibility, meetsRequirements } from './compatibility';
import { createInitialState } from '../data/mock';

const { pets, adopters } = createInitialState();
const thor = pets.find((p) => p.id === 'p1')!;
const mia = pets.find((p) => p.id === 'p2')!;
const bob = pets.find((p) => p.id === 'p3')!;
const marina = adopters.find((a) => a.id === 'a1')!;

describe('meetsRequirements', () => {
  it('aceita pet sem requisitos', () => {
    expect(meetsRequirements(thor, marina)).toBe(true);
  });

  it('exige casa telada quando o pet pede', () => {
    expect(meetsRequirements(mia, { ...marina, screenedHome: false })).toBe(false);
    expect(meetsRequirements(mia, marina)).toBe(true);
  });

  it('exige quintal quando o pet pede', () => {
    expect(meetsRequirements(bob, marina)).toBe(false);
    expect(meetsRequirements(bob, { ...marina, hasYard: true })).toBe(true);
  });
});

describe('compatibility', () => {
  it('pontua 100 quando tudo combina', () => {
    expect(compatibility(thor, marina).score).toBe(100);
  });

  it('perde 40 quando a espécie não combina', () => {
    const prefereGato = { ...marina, preferences: { ...marina.preferences, species: ['gato' as const] } };
    expect(compatibility(thor, prefereGato).score).toBe(60);
  });

  it('trata lista vazia como sem preferência', () => {
    const semPreferencias = { ...marina, preferences: { species: [], sizes: [], temperaments: [] } };
    expect(compatibility(thor, semPreferencias).score).toBe(100);
  });

  it('lista os motivos que combinam', () => {
    const { reasons } = compatibility(thor, marina);
    expect(reasons).toEqual(['Espécie combina', 'Porte combina', 'Temperamento combina']);
  });

  it('informa casa telada quando o pet exige e o adotante tem', () => {
    expect(compatibility(mia, marina).reasons).toContain('Casa telada');
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- --run src/domain/compatibility.test.ts`
Expected: FAIL, módulo não encontrado.

- [ ] **Step 3: Implementar**

Criar `src/domain/compatibility.ts`:

```ts
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
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test -- --run src/domain/compatibility.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src
git commit -m "Adiciona regras de requisitos e compatibilidade"
```

---

### Task 4: Motor de decisões e match duplo

**Files:**
- Create: `apps/web/src/domain/matching.ts`
- Test: `apps/web/src/domain/matching.test.ts`

**Interfaces:**
- Consumes: `compatibility`, `meetsRequirements` de `./compatibility`; tipos de `./types`.
- Produces:
  - `REAPPEAR_MS: number` (30 dias em milissegundos)
  - `findDecision(list: Decision[], adopterId: string, petId: string): Decision | undefined`
  - `isSuppressed(decision: Decision | undefined, now: number): boolean`
  - `upsertDecision(list: Decision[], next: Decision): Decision[]`
  - `matchIdFor(adopterId: string, petId: string): string`
  - `withMutualMatch(matches: Match[], adopterDecisions: Decision[], ongDecisions: Decision[], pet: Pet, adopterId: string, now: number): Match[]`
  - `adopterFeed(pets: Pet[], adopter: Adopter, adopterDecisions: Decision[], now: number): Pet[]`
  - `ongQueue(adopterDecisions: Decision[], ongDecisions: Decision[], pets: Pet[], ongId: string, now: number): { adopterId: string; petId: string }[]`
  - `canAdvance(from: MatchStage, to: MatchStage): boolean`

- [ ] **Step 1: Escrever os testes**

Criar `src/domain/matching.test.ts`:

```ts
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
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- --run src/domain/matching.test.ts`
Expected: FAIL, módulo não encontrado.

- [ ] **Step 3: Implementar**

Criar `src/domain/matching.ts`:

```ts
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
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test -- --run src/domain/matching.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src
git commit -m "Adiciona motor de decisoes, match duplo e estados do processo"
```

---

### Task 5: Reducer, contexto e persistência

**Files:**
- Create: `apps/web/src/state/reducer.ts`, `apps/web/src/state/context.ts`, `apps/web/src/state/AppProvider.tsx`, `apps/web/src/test/render.tsx`
- Test: `apps/web/src/state/reducer.test.ts`

**Interfaces:**
- Consumes: `createInitialState`, funções de `../domain/matching`.
- Produces:
  - `Action` (união abaixo) e `reducer(state: AppState, action: Action): AppState`
  - `useApp(): { state: AppState; dispatch: Dispatch<Action> }`
  - `AppProvider({ children, initialState?, persist? })`
  - `renderWithApp(ui, options?: { state?: AppState; route?: string })` e `stateWithSession(role: Role, userId: string): AppState`

Ações:

```ts
type Action =
  | { type: 'login'; role: Role; userId: string }
  | { type: 'logout' }
  | { type: 'swipeAdopter'; adopterId: string; petId: string; direction: Direction; now: number }
  | { type: 'swipeOng'; adopterId: string; petId: string; direction: Direction; now: number }
  | { type: 'sendMessage'; matchId: string; from: Role; text: string; now: number }
  | { type: 'setStage'; matchId: string; stage: MatchStage }
  | { type: 'addPet'; pet: Pet }
  | { type: 'saveAdopter'; adopter: Adopter }
  | { type: 'reset' };
```

- [ ] **Step 1: Escrever os testes do reducer**

Criar `src/state/reducer.test.ts`:

```ts
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
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- --run src/state/reducer.test.ts`
Expected: FAIL, módulo não encontrado.

- [ ] **Step 3: Implementar o reducer**

Criar `src/state/reducer.ts`:

```ts
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
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test -- --run src/state/reducer.test.ts`
Expected: PASS.

- [ ] **Step 5: Criar contexto, provider e helper de teste**

Criar `src/state/context.ts`:

```ts
// Contexto do aplicativo e o hook para acessar estado e dispatch.
import { createContext, useContext, type Dispatch } from 'react';
import type { AppState } from '../domain/types';
import type { Action } from './reducer';

export interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<Action>;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp deve ser usado dentro do AppProvider');
  return value;
}
```

Criar `src/state/AppProvider.tsx`:

```tsx
// Provider que mantém o estado com reducer e o persiste no localStorage.
import { useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { createInitialState } from '../data/mock';
import type { AppState } from '../domain/types';
import { AppContext } from './context';
import { reducer } from './reducer';

const STORAGE_KEY = 'tinder-pet-state';

// Lê o estado salvo, devolvendo null quando não existe ou está ilegível.
function load(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AppState) : null;
  } catch {
    return null;
  }
}

interface Props {
  children: ReactNode;
  initialState?: AppState;
  persist?: boolean;
}

export function AppProvider({ children, initialState, persist = true }: Props) {
  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    () => initialState ?? (persist ? load() : null) ?? createInitialState(),
  );

  useEffect(() => {
    if (!persist) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Armazenamento indisponível: o protótipo continua sem persistir.
    }
  }, [state, persist]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
```

Criar `src/test/render.tsx`:

```tsx
// Helpers para renderizar componentes com provider e roteador nos testes.
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { createInitialState } from '../data/mock';
import type { AppState, Role } from '../domain/types';
import { AppProvider } from '../state/AppProvider';

// Estado inicial já com uma sessão aberta.
export function stateWithSession(role: Role, userId: string): AppState {
  return { ...createInitialState(), session: { role, userId } };
}

interface Options {
  state?: AppState;
  route?: string;
}

export function renderWithApp(ui: ReactElement, { state, route = '/' }: Options = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AppProvider initialState={state ?? createInitialState()} persist={false}>
        {ui}
      </AppProvider>
    </MemoryRouter>,
  );
}
```

- [ ] **Step 6: Verificar tipos e commit**

Run: `npx tsc -b && npm run lint`
Expected: sem erros.

```bash
git add src
git commit -m "Adiciona reducer, contexto e persistencia do estado"
```

---

### Task 6: Gesto de swipe, card arrastável e componentes de card

**Files:**
- Create: `apps/web/src/hooks/useSwipe.ts`, `apps/web/src/hooks/useNewMatch.ts`, `apps/web/src/components/SwipeCard.tsx`, `apps/web/src/components/SwipeActions.tsx`, `apps/web/src/components/PetCard.tsx`, `apps/web/src/components/PersonCard.tsx`, `apps/web/src/components/Detail.tsx`, `apps/web/src/components/MatchOverlay.tsx`
- Test: `apps/web/src/hooks/useSwipe.test.ts`, `apps/web/src/components/cards.test.tsx`

**Interfaces:**
- Consumes: `Direction`, `Pet`, `Adopter`, `Ong`, `Match` de `../domain/types`; rótulos de `../domain/labels`; `useApp`.
- Produces:
  - `SWIPE_THRESHOLD = 100`, `resolveDirection(dx: number): Direction | null`, `useSwipe(onSwipe, onTap)` retornando `{ dx, handlers }`
  - `useNewMatch(isMine: (m: Match) => boolean): { fresh: Match | null; dismiss: () => void }`
  - `<SwipeCard onSwipe onTap>{children}</SwipeCard>`
  - `<SwipeActions leftLabel rightLabel onLeft onRight />`
  - `<PetCard pet ongName compatibility />`, `<PersonCard adopter petName />`
  - `<Detail title onClose>{children}</Detail>`
  - `<MatchOverlay match title subtitle onClose />`

O gesto de arrastar com ponteiro não é testável no jsdom. A lógica de decisão é testada como função pura e o arrasto é verificado manualmente no navegador na Task 9.

- [ ] **Step 1: Escrever os testes**

Criar `src/hooks/useSwipe.test.ts`:

```ts
import { SWIPE_THRESHOLD, resolveDirection } from './useSwipe';

describe('resolveDirection', () => {
  it('reconhece arrastar para a direita e para a esquerda', () => {
    expect(resolveDirection(SWIPE_THRESHOLD)).toBe('right');
    expect(resolveDirection(-SWIPE_THRESHOLD)).toBe('left');
  });

  it('ignora arrasto curto', () => {
    expect(resolveDirection(SWIPE_THRESHOLD - 1)).toBeNull();
    expect(resolveDirection(0)).toBeNull();
  });
});
```

Criar `src/components/cards.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Detail } from './Detail';
import { PersonCard } from './PersonCard';
import { PetCard } from './PetCard';
import { SwipeActions } from './SwipeActions';
import { createInitialState } from '../data/mock';

const { pets, adopters } = createInitialState();

describe('PetCard', () => {
  it('mostra dados do pet, da ONG e a compatibilidade', () => {
    render(<PetCard pet={pets[0]} ongName="Patas do Bem" compatibility={{ score: 92, reasons: ['Porte combina'] }} />);
    expect(screen.getByText('Thor, 2 anos')).toBeInTheDocument();
    expect(screen.getByText('92% compatível')).toBeInTheDocument();
    expect(screen.getByText('Porte combina')).toBeInTheDocument();
    expect(screen.getByText(/Patas do Bem/)).toBeInTheDocument();
  });
});

describe('PersonCard', () => {
  it('mostra o adotante, o pet curtido e as etiquetas de moradia', () => {
    render(<PersonCard adopter={adopters[0]} petName="Thor" />);
    expect(screen.getByText('Marina, 29 anos')).toBeInTheDocument();
    expect(screen.getByText('Curtiu o Thor')).toBeInTheDocument();
    expect(screen.getByText('Casa telada')).toBeInTheDocument();
  });
});

describe('SwipeActions', () => {
  it('chama os callbacks dos botões', async () => {
    const onLeft = vi.fn();
    const onRight = vi.fn();
    render(<SwipeActions leftLabel="Passar" rightLabel="Curtir" onLeft={onLeft} onRight={onRight} />);
    await userEvent.click(screen.getByRole('button', { name: 'Passar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Curtir' }));
    expect(onLeft).toHaveBeenCalledTimes(1);
    expect(onRight).toHaveBeenCalledTimes(1);
  });
});

describe('Detail', () => {
  it('exibe o conteúdo e fecha pelo botão', async () => {
    const onClose = vi.fn();
    render(<Detail title="Thor" onClose={onClose}>Conteúdo</Detail>);
    expect(screen.getByRole('dialog', { name: 'Thor' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- --run src/hooks src/components`
Expected: FAIL, módulos não encontrados.

- [ ] **Step 3: Implementar o gesto**

Criar `src/hooks/useSwipe.ts`:

```ts
// Gesto de arrastar na horizontal com ponteiro, com toque simples tratado como clique.
import { useRef, useState, type PointerEvent } from 'react';
import type { Direction } from '../domain/types';

export const SWIPE_THRESHOLD = 100;
const TAP_DISTANCE = 6;

// Converte o deslocamento horizontal em direção, ou null se foi curto demais.
export function resolveDirection(dx: number): Direction | null {
  if (dx >= SWIPE_THRESHOLD) return 'right';
  if (dx <= -SWIPE_THRESHOLD) return 'left';
  return null;
}

export function useSwipe(onSwipe: (direction: Direction) => void, onTap: () => void) {
  const [dx, setDx] = useState(0);
  const startX = useRef<number | null>(null);
  const maxMove = useRef(0);

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    startX.current = e.clientX;
    maxMove.current = 0;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (startX.current === null) return;
    const delta = e.clientX - startX.current;
    maxMove.current = Math.max(maxMove.current, Math.abs(delta));
    setDx(delta);
  };

  const onPointerUp = (e: PointerEvent<HTMLElement>) => {
    if (startX.current === null) return;
    const delta = e.clientX - startX.current;
    startX.current = null;
    setDx(0);
    const direction = resolveDirection(delta);
    if (direction) onSwipe(direction);
    else if (maxMove.current < TAP_DISTANCE) onTap();
  };

  const onPointerCancel = () => {
    startX.current = null;
    setDx(0);
  };

  return { dx, handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel } };
}
```

Criar `src/hooks/useNewMatch.ts`:

```ts
// Detecta quando um novo match do usuário atual aparece no estado.
import { useEffect, useRef, useState } from 'react';
import type { Match } from '../domain/types';
import { useApp } from '../state/context';

export function useNewMatch(isMine: (match: Match) => boolean) {
  const { state } = useApp();
  const seen = useRef(state.matches.length);
  const filter = useRef(isMine);
  filter.current = isMine;
  const [fresh, setFresh] = useState<Match | null>(null);

  useEffect(() => {
    if (state.matches.length > seen.current) {
      const created = state.matches.slice(seen.current).find(filter.current);
      if (created) setFresh(created);
    }
    seen.current = state.matches.length;
  }, [state.matches]);

  return { fresh, dismiss: () => setFresh(null) };
}
```

- [ ] **Step 4: Implementar os componentes**

Criar `src/components/SwipeCard.tsx`:

```tsx
// Envolve um card para que possa ser arrastado, inclinado e solto para decidir.
import type { ReactNode } from 'react';
import type { Direction } from '../domain/types';
import { SWIPE_THRESHOLD, useSwipe } from '../hooks/useSwipe';

interface Props {
  onSwipe: (direction: Direction) => void;
  onTap: () => void;
  children: ReactNode;
}

export function SwipeCard({ onSwipe, onTap, children }: Props) {
  const { dx, handlers } = useSwipe(onSwipe, onTap);
  const style = { transform: `translateX(${dx}px) rotate(${dx / 20}deg)` };
  return (
    <div className="swipe-card" style={style} {...handlers}>
      {dx >= SWIPE_THRESHOLD && <span className="swipe-badge swipe-badge-right">Sim</span>}
      {dx <= -SWIPE_THRESHOLD && <span className="swipe-badge swipe-badge-left">Não</span>}
      {children}
    </div>
  );
}
```

Criar `src/components/SwipeActions.tsx`:

```tsx
// Botões de esquerda e direita, alternativa acessível ao gesto de arrastar.
interface Props {
  leftLabel: string;
  rightLabel: string;
  onLeft: () => void;
  onRight: () => void;
}

export function SwipeActions({ leftLabel, rightLabel, onLeft, onRight }: Props) {
  return (
    <div className="swipe-actions">
      <button type="button" className="action-left" onClick={onLeft}>
        {leftLabel}
      </button>
      <button type="button" className="action-right" onClick={onRight}>
        {rightLabel}
      </button>
    </div>
  );
}
```

Criar `src/components/PetCard.tsx`:

```tsx
// Card do pet exibido no feed do adotante.
import { sizeLabel, temperamentLabel } from '../domain/labels';
import type { Pet } from '../domain/types';

interface Props {
  pet: Pet;
  ongName: string;
  compatibility: { score: number; reasons: string[] };
}

export function PetCard({ pet, ongName, compatibility }: Props) {
  return (
    <article className="card">
      <div className="card-photo photo-pet">
        <span className="photo-initial" aria-hidden="true">{pet.name[0]}</span>
        <span className="chip chip-success card-corner">{compatibility.score}% compatível</span>
      </div>
      <div className="card-body">
        <h2>{pet.name}, {pet.ageYears} {pet.ageYears === 1 ? 'ano' : 'anos'}</h2>
        <p className="muted">{sizeLabel[pet.size]}, {temperamentLabel[pet.temperament].toLowerCase()}. {ongName}</p>
        <div className="chips">
          {compatibility.reasons.map((reason) => (
            <span key={reason} className="chip">{reason}</span>
          ))}
        </div>
      </div>
    </article>
  );
}
```

Criar `src/components/PersonCard.tsx`:

```tsx
// Card do adotante exibido no feed da ONG.
import { housingLabel } from '../domain/labels';
import type { Adopter } from '../domain/types';

interface Props {
  adopter: Adopter;
  petName: string;
}

export function PersonCard({ adopter, petName }: Props) {
  return (
    <article className="card">
      <div className="card-photo photo-person">
        <span className="photo-initial" aria-hidden="true">{adopter.name[0]}</span>
        <span className="chip card-corner">Curtiu o {petName}</span>
      </div>
      <div className="card-body">
        <h2>{adopter.name}, {adopter.age} anos</h2>
        <p className="muted">{adopter.city}. {housingLabel[adopter.housing]}</p>
        <div className="chips">
          {adopter.screenedHome && <span className="chip chip-success">Casa telada</span>}
          {adopter.hasYard && <span className="chip">Quintal</span>}
          <span className="chip">{adopter.otherPets ? 'Tem outros pets' : 'Sem outros pets'}</span>
        </div>
      </div>
    </article>
  );
}
```

Criar `src/components/Detail.tsx`:

```tsx
// Painel de detalhe aberto ao tocar na foto do card.
import type { ReactNode } from 'react';

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Detail({ title, onClose, children }: Props) {
  return (
    <div className="overlay">
      <div className="dialog" role="dialog" aria-label={title}>
        <h2>{title}</h2>
        {children}
        <button type="button" onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}
```

Criar `src/components/MatchOverlay.tsx`:

```tsx
// Aviso de match com atalho para abrir a conversa.
import { Link } from 'react-router-dom';
import type { Match } from '../domain/types';

interface Props {
  match: Match;
  subtitle: string;
  onClose: () => void;
}

export function MatchOverlay({ match, subtitle, onClose }: Props) {
  return (
    <div className="overlay">
      <div className="dialog match-dialog" role="dialog" aria-label="Deu match">
        <h2>Deu match</h2>
        <p>{subtitle}</p>
        <Link className="button-link" to={`/matches/${match.id}`} onClick={onClose}>Abrir conversa</Link>
        <button type="button" onClick={onClose}>Continuar</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npm test -- --run src/hooks src/components && npx tsc -b && npm run lint`
Expected: PASS e sem erros.

- [ ] **Step 6: Commit**

```bash
git add src
git commit -m "Adiciona gesto de swipe e componentes de card"
```

---

### Task 7: Layout, login, feed do adotante e feed da ONG

**Files:**
- Create: `apps/web/src/components/Shell.tsx`, `apps/web/src/screens/Login.tsx`, `apps/web/src/screens/AdopterFeed.tsx`, `apps/web/src/screens/OngFeed.tsx`, `apps/web/src/App.tsx` (substituir), `apps/web/src/main.tsx` (modificar)
- Modify: `apps/web/src/styles.css`
- Test: `apps/web/src/screens/feeds.test.tsx`

**Interfaces:**
- Consumes: tudo das tarefas 2 a 6.
- Produces: rotas `/` (Login), `/adotante` (AdopterFeed), `/ong` (OngFeed); `Shell` com navegação por papel; `RequireRole`.

- [ ] **Step 1: Escrever os testes das telas**

Criar `src/screens/feeds.test.tsx`:

```tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdopterFeed } from './AdopterFeed';
import { Login } from './Login';
import { OngFeed } from './OngFeed';
import { renderWithApp, stateWithSession } from '../test/render';

describe('Login', () => {
  it('lista os perfis de demonstração', () => {
    renderWithApp(<Login />);
    expect(screen.getByRole('button', { name: /Marina/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Patas do Bem/ })).toBeInTheDocument();
  });
});

describe('AdopterFeed', () => {
  it('mostra o pet mais compatível primeiro', () => {
    renderWithApp(<AdopterFeed />, { state: stateWithSession('adopter', 'a1') });
    expect(screen.getByText('Thor, 2 anos')).toBeInTheDocument();
    expect(screen.getByText('100% compatível')).toBeInTheDocument();
  });

  it('avança para o próximo pet ao curtir', async () => {
    renderWithApp(<AdopterFeed />, { state: stateWithSession('adopter', 'a1') });
    await userEvent.click(screen.getByRole('button', { name: 'Curtir' }));
    expect(screen.queryByText('Thor, 2 anos')).not.toBeInTheDocument();
    expect(screen.getByText('Nina, 5 anos')).toBeInTheDocument();
  });

  it('não mostra pet que exige quintal para quem não tem', async () => {
    renderWithApp(<AdopterFeed />, { state: stateWithSession('adopter', 'a1') });
    for (let i = 0; i < 6; i += 1) {
      const pass = screen.queryByRole('button', { name: 'Passar' });
      if (!pass) break;
      expect(screen.queryByText(/Bob/)).not.toBeInTheDocument();
      await userEvent.click(pass);
    }
    expect(screen.getByText(/Não há pets novos/)).toBeInTheDocument();
  });

  it('abre o detalhe ao tocar no botão de detalhes', async () => {
    renderWithApp(<AdopterFeed />, { state: stateWithSession('adopter', 'a1') });
    await userEvent.click(screen.getByRole('button', { name: 'Ver detalhes' }));
    expect(screen.getByRole('dialog', { name: 'Thor' })).toBeInTheDocument();
    expect(screen.getByText(/Adora correr e brincar de bola/)).toBeInTheDocument();
  });

  it('avisa o match quando a ONG já tinha curtido o adotante', async () => {
    const state = stateWithSession('adopter', 'a1');
    state.ongDecisions.push({ adopterId: 'a1', petId: 'p1', direction: 'right', at: 1 });
    renderWithApp(<AdopterFeed />, { state });
    await userEvent.click(screen.getByRole('button', { name: 'Curtir' }));
    expect(screen.getByRole('dialog', { name: 'Deu match' })).toBeInTheDocument();
  });
});

describe('OngFeed', () => {
  it('mostra o primeiro adotante que curtiu um pet da ONG', () => {
    renderWithApp(<OngFeed />, { state: stateWithSession('ong', 'ong1') });
    expect(screen.getByText('Carlos, 41 anos')).toBeInTheDocument();
    expect(screen.getByText('Curtiu o Thor')).toBeInTheDocument();
  });

  it('aceita e avança para o próximo adotante', async () => {
    renderWithApp(<OngFeed />, { state: stateWithSession('ong', 'ong1') });
    await userEvent.click(screen.getByRole('button', { name: 'Aceitar' }));
    expect(screen.queryByText('Carlos, 41 anos')).not.toBeInTheDocument();
    expect(screen.getByText('Julia, 34 anos')).toBeInTheDocument();
  });

  it('mostra o perfil completo no detalhe', async () => {
    renderWithApp(<OngFeed />, { state: stateWithSession('ong', 'ong1') });
    await userEvent.click(screen.getByRole('button', { name: 'Ver detalhes' }));
    expect(screen.getByText(/Família com quintal grande/)).toBeInTheDocument();
  });

  it('mostra estado vazio quando não há adotantes', async () => {
    renderWithApp(<OngFeed />, { state: stateWithSession('ong', 'ong2') });
    await userEvent.click(screen.getByRole('button', { name: 'Recusar' }));
    expect(screen.getByText(/Nenhum adotante aguardando/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- --run src/screens/feeds.test.tsx`
Expected: FAIL, módulos não encontrados.

- [ ] **Step 3: Implementar Login**

Criar `src/screens/Login.tsx`:

```tsx
// Login simulado: escolhe um perfil de demonstração ou abre o cadastro de adotante.
import { Link, useNavigate } from 'react-router-dom';
import type { Role } from '../domain/types';
import { useApp } from '../state/context';

export function Login() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const enter = (role: Role, userId: string) => {
    dispatch({ type: 'login', role, userId });
    navigate(role === 'adopter' ? '/adotante' : '/ong');
  };

  return (
    <section className="login">
      <h1>Tinder Pet</h1>
      <p className="muted">Protótipo com dados fictícios. Escolha um perfil para entrar.</p>

      <h2>Adotantes</h2>
      {state.adopters.map((a) => (
        <button key={a.id} type="button" onClick={() => enter('adopter', a.id)}>
          {a.name}, {a.city}
        </button>
      ))}

      <h2>ONGs</h2>
      {state.ongs.map((o) => (
        <button key={o.id} type="button" onClick={() => enter('ong', o.id)}>
          {o.name}, {o.city}
        </button>
      ))}

      <Link className="button-link" to="/cadastro">Criar perfil de adotante</Link>
      <button type="button" className="link-button" onClick={() => dispatch({ type: 'reset' })}>
        Restaurar dados de demonstração
      </button>
    </section>
  );
}
```

- [ ] **Step 4: Implementar AdopterFeed**

Criar `src/screens/AdopterFeed.tsx`:

```tsx
// Feed do adotante: mostra um pet por vez, com swipe para curtir ou passar.
import { useState } from 'react';
import { Detail } from '../components/Detail';
import { MatchOverlay } from '../components/MatchOverlay';
import { PetCard } from '../components/PetCard';
import { SwipeActions } from '../components/SwipeActions';
import { SwipeCard } from '../components/SwipeCard';
import { compatibility } from '../domain/compatibility';
import { housingLabel, sizeLabel, speciesLabel, temperamentLabel } from '../domain/labels';
import { adopterFeed } from '../domain/matching';
import type { Direction } from '../domain/types';
import { useNewMatch } from '../hooks/useNewMatch';
import { useApp } from '../state/context';

export function AdopterFeed() {
  const { state, dispatch } = useApp();
  const [detailOpen, setDetailOpen] = useState(false);
  const adopter = state.adopters.find((a) => a.id === state.session?.userId);
  const { fresh, dismiss } = useNewMatch((m) => m.adopterId === adopter?.id);

  if (!adopter) return <p>Perfil não encontrado.</p>;

  const pet = adopterFeed(state.pets, adopter, state.adopterDecisions, Date.now())[0];
  const ong = pet && state.ongs.find((o) => o.id === pet.ongId);

  const swipe = (direction: Direction) => {
    if (!pet) return;
    dispatch({ type: 'swipeAdopter', adopterId: adopter.id, petId: pet.id, direction, now: Date.now() });
  };

  return (
    <section className="feed">
      {pet && ong ? (
        <>
          <SwipeCard key={pet.id} onSwipe={swipe} onTap={() => setDetailOpen(true)}>
            <PetCard pet={pet} ongName={ong.name} compatibility={compatibility(pet, adopter)} />
          </SwipeCard>
          <button type="button" className="link-button" onClick={() => setDetailOpen(true)}>
            Ver detalhes
          </button>
          <SwipeActions leftLabel="Passar" rightLabel="Curtir" onLeft={() => swipe('left')} onRight={() => swipe('right')} />
          {detailOpen && (
            <Detail title={pet.name} onClose={() => setDetailOpen(false)}>
              <p>{pet.description}</p>
              <p className="muted">
                {speciesLabel[pet.species]}, {sizeLabel[pet.size]}, {temperamentLabel[pet.temperament]}. ONG {ong.name}, {ong.city}.
              </p>
              <p className="muted">
                Requisitos: {[pet.requiresScreenedHome && 'casa telada', pet.requiresYard && 'quintal'].filter(Boolean).join(', ') || 'nenhum'}.
                Seu perfil: {housingLabel[adopter.housing].toLowerCase()}.
              </p>
            </Detail>
          )}
        </>
      ) : (
        <p className="empty">Não há pets novos por agora. Volte mais tarde.</p>
      )}
      {fresh && (
        <MatchOverlay
          match={fresh}
          subtitle={`Você e a ONG curtiram ${state.pets.find((p) => p.id === fresh.petId)?.name ?? 'o pet'}.`}
          onClose={dismiss}
        />
      )}
    </section>
  );
}
```

- [ ] **Step 5: Implementar OngFeed**

Criar `src/screens/OngFeed.tsx`:

```tsx
// Feed da ONG: mostra um adotante por vez entre quem curtiu um pet da ONG.
import { useState } from 'react';
import { Detail } from '../components/Detail';
import { MatchOverlay } from '../components/MatchOverlay';
import { PersonCard } from '../components/PersonCard';
import { SwipeActions } from '../components/SwipeActions';
import { SwipeCard } from '../components/SwipeCard';
import { housingLabel, sizeLabel, speciesLabel, temperamentLabel } from '../domain/labels';
import { ongQueue } from '../domain/matching';
import type { Direction } from '../domain/types';
import { useNewMatch } from '../hooks/useNewMatch';
import { useApp } from '../state/context';

export function OngFeed() {
  const { state, dispatch } = useApp();
  const [detailOpen, setDetailOpen] = useState(false);
  const ongId = state.session?.userId ?? '';
  const { fresh, dismiss } = useNewMatch((m) => m.ongId === ongId);

  const current = ongQueue(state.adopterDecisions, state.ongDecisions, state.pets, ongId, Date.now())[0];
  const adopter = current && state.adopters.find((a) => a.id === current.adopterId);
  const pet = current && state.pets.find((p) => p.id === current.petId);

  const swipe = (direction: Direction) => {
    if (!current) return;
    dispatch({ type: 'swipeOng', adopterId: current.adopterId, petId: current.petId, direction, now: Date.now() });
  };

  return (
    <section className="feed">
      {adopter && pet ? (
        <>
          <SwipeCard key={`${adopter.id}-${pet.id}`} onSwipe={swipe} onTap={() => setDetailOpen(true)}>
            <PersonCard adopter={adopter} petName={pet.name} />
          </SwipeCard>
          <button type="button" className="link-button" onClick={() => setDetailOpen(true)}>
            Ver detalhes
          </button>
          <SwipeActions leftLabel="Recusar" rightLabel="Aceitar" onLeft={() => swipe('left')} onRight={() => swipe('right')} />
          {detailOpen && (
            <Detail title={adopter.name} onClose={() => setDetailOpen(false)}>
              <p>{adopter.description}</p>
              <p className="muted">
                {adopter.city}. {housingLabel[adopter.housing]}. {adopter.screenedHome ? 'Casa telada' : 'Sem tela de proteção'}.{' '}
                {adopter.hasYard ? 'Com quintal' : 'Sem quintal'}. {adopter.otherPets ? 'Tem outros pets' : 'Sem outros pets'}.
              </p>
              <p className="muted">
                Pet de interesse: {pet.name} ({speciesLabel[pet.species]}, {sizeLabel[pet.size]}, {temperamentLabel[pet.temperament]}).
              </p>
            </Detail>
          )}
        </>
      ) : (
        <p className="empty">Nenhum adotante aguardando avaliação.</p>
      )}
      {fresh && (
        <MatchOverlay
          match={fresh}
          subtitle={`${state.adopters.find((a) => a.id === fresh.adopterId)?.name ?? 'O adotante'} também curtiu ${state.pets.find((p) => p.id === fresh.petId)?.name ?? 'o pet'}.`}
          onClose={dismiss}
        />
      )}
    </section>
  );
}
```

- [ ] **Step 6: Implementar Shell, rotas e estilos**

Criar `src/components/Shell.tsx`:

```tsx
// Estrutura da página: cabeçalho, navegação por papel e proteção de rota.
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import type { Role } from '../domain/types';
import { useApp } from '../state/context';

// Redireciona ao login quando a sessão não tem o papel esperado.
export function RequireRole({ role }: { role: Role }) {
  const { state } = useApp();
  if (state.session?.role !== role) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function Shell() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const role = state.session?.role;

  const logout = () => {
    dispatch({ type: 'logout' });
    navigate('/');
  };

  return (
    <div className="app">
      <header className="header">
        <strong>Tinder Pet</strong>
        {role && (
          <button type="button" className="link-button" onClick={logout}>
            Sair
          </button>
        )}
      </header>
      <main className="main">
        <Outlet />
      </main>
      {role === 'adopter' && (
        <nav className="nav" aria-label="Navegação">
          <NavLink to="/adotante" end>Descobrir</NavLink>
          <NavLink to="/matches">Conversas</NavLink>
          <NavLink to="/adotante/perfil">Perfil</NavLink>
        </nav>
      )}
      {role === 'ong' && (
        <nav className="nav" aria-label="Navegação">
          <NavLink to="/ong" end>Adotantes</NavLink>
          <NavLink to="/matches">Conversas</NavLink>
          <NavLink to="/ong/pets/novo">Novo pet</NavLink>
        </nav>
      )}
    </div>
  );
}
```

Substituir `src/App.tsx`:

```tsx
// Definição das rotas do protótipo.
import { Route, Routes } from 'react-router-dom';
import { RequireRole, Shell } from './components/Shell';
import { AdopterFeed } from './screens/AdopterFeed';
import { Login } from './screens/Login';
import { OngFeed } from './screens/OngFeed';

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Login />} />
        <Route element={<RequireRole role="adopter" />}>
          <Route path="adotante" element={<AdopterFeed />} />
        </Route>
        <Route element={<RequireRole role="ong" />}>
          <Route path="ong" element={<OngFeed />} />
        </Route>
      </Route>
    </Routes>
  );
}
```

Substituir `src/main.tsx`:

```tsx
// Ponto de entrada: monta o aplicativo com provider de estado e HashRouter.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { AppProvider } from './state/AppProvider';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </HashRouter>
  </StrictMode>,
);
```

Escrever `src/styles.css`:

```css
/* Estilos globais do protótipo, pensados primeiro para telas de celular. */
:root {
  --bg: #fafaf9;
  --surface: #ffffff;
  --text: #1c1917;
  --muted: #78716c;
  --border: #e7e5e4;
  --accent: #e8590c;
  --success-bg: #ebfbee;
  --success-text: #2b8a3e;
  --danger: #c92a2a;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  background: var(--bg);
  color: var(--text);
}

.app { max-width: 420px; min-height: 100dvh; margin: 0 auto; display: flex; flex-direction: column; background: var(--bg); }
.header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid var(--border); background: var(--surface); }
.main { flex: 1; padding: 16px; overflow-x: hidden; }
.nav { display: flex; justify-content: space-around; border-top: 1px solid var(--border); background: var(--surface); padding: 10px 0; position: sticky; bottom: 0; }
.nav a { color: var(--muted); text-decoration: none; font-size: 14px; }
.nav a.active { color: var(--accent); font-weight: 600; }

h1 { font-size: 24px; margin: 0 0 8px; }
h2 { font-size: 18px; margin: 16px 0 8px; }
p { line-height: 1.5; }
.muted { color: var(--muted); font-size: 14px; }
.empty { text-align: center; color: var(--muted); padding: 48px 0; }

button, .button-link {
  display: block; width: 100%; margin: 8px 0; padding: 12px; font: inherit; text-align: center; text-decoration: none;
  color: var(--text); background: var(--surface); border: 1px solid var(--border); border-radius: 10px; cursor: pointer;
}
button:focus-visible, a:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.link-button { width: auto; border: none; background: none; color: var(--accent); padding: 4px 0; margin: 4px auto; }

.feed { display: flex; flex-direction: column; align-items: stretch; }
.swipe-card { position: relative; touch-action: pan-y; user-select: none; cursor: grab; }
.swipe-badge { position: absolute; top: 16px; z-index: 1; padding: 4px 12px; font-weight: 700; border: 2px solid; border-radius: 8px; background: var(--surface); }
.swipe-badge-right { left: 16px; color: var(--success-text); }
.swipe-badge-left { right: 16px; color: var(--danger); }

.card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; }
.card-photo { position: relative; height: 240px; display: flex; align-items: center; justify-content: center; }
.photo-pet { background: #fff3bf; }
.photo-person { background: #d0ebff; }
.photo-initial { font-size: 96px; font-weight: 600; color: rgba(0, 0, 0, 0.25); }
.card-corner { position: absolute; top: 12px; right: 12px; }
.card-body { padding: 12px 16px 16px; }
.card-body h2 { margin: 0 0 4px; }

.chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.chip { font-size: 12px; padding: 3px 10px; border-radius: 999px; background: #f1f3f5; color: #495057; }
.chip-success { background: var(--success-bg); color: var(--success-text); }

.swipe-actions { display: flex; gap: 16px; }
.action-left { color: var(--danger); border-color: var(--danger); }
.action-right { color: var(--success-text); border-color: var(--success-text); }

.overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.45); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 10; }
.dialog { width: 100%; max-width: 380px; background: var(--surface); border-radius: 14px; padding: 16px; }
.match-dialog { text-align: center; }

.login button { margin: 6px 0; }

.form label { display: block; margin: 12px 0 4px; font-size: 14px; }
.form input[type='text'], .form input[type='number'], .form select, .form textarea { width: 100%; padding: 10px; font: inherit; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); }
.form .check { display: flex; align-items: center; gap: 8px; margin: 8px 0; }
.form fieldset { border: 1px solid var(--border); border-radius: 8px; margin: 12px 0; }
.form .primary { background: var(--accent); color: #fff; border-color: var(--accent); }

.list-item { display: block; padding: 12px; margin: 8px 0; text-decoration: none; color: inherit; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; }
.messages { display: flex; flex-direction: column; gap: 6px; margin: 12px 0; }
.bubble { max-width: 80%; padding: 8px 12px; border-radius: 14px; background: #f1f3f5; align-self: flex-start; }
.bubble-mine { align-self: flex-end; background: #ffe8cc; }
.stage-panel { padding: 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface); }
```

- [ ] **Step 7: Rodar e ver passar**

Run: `npm test -- --run && npx tsc -b && npm run lint && npm run build`
Expected: todos os testes passam, sem erros de tipo e lint, build conclui.

- [ ] **Step 8: Commit**

```bash
git add src
git commit -m "Adiciona login, feed do adotante e feed da ONG"
```

---

### Task 8: Conversas, chat e processo de adoção

**Files:**
- Create: `apps/web/src/screens/Matches.tsx`, `apps/web/src/screens/Chat.tsx`
- Modify: `apps/web/src/App.tsx`
- Test: `apps/web/src/screens/chat.test.tsx`

**Interfaces:**
- Consumes: `useApp`, `stageLabel`, `canAdvance`, `Action` `sendMessage` e `setStage`.
- Produces: rotas `/matches` (Matches) e `/matches/:matchId` (Chat), acessíveis aos dois papéis.

- [ ] **Step 1: Escrever os testes**

Criar `src/screens/chat.test.tsx`:

```tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { Chat } from './Chat';
import { Matches } from './Matches';
import { renderWithApp, stateWithSession } from '../test/render';

function chatRoutes() {
  return (
    <Routes>
      <Route path="/matches" element={<Matches />} />
      <Route path="/matches/:matchId" element={<Chat />} />
    </Routes>
  );
}

describe('Matches', () => {
  it('lista as conversas do adotante com o estado do processo', () => {
    renderWithApp(chatRoutes(), { state: stateWithSession('adopter', 'a3'), route: '/matches' });
    expect(screen.getByText('Mia')).toBeInTheDocument();
    expect(screen.getByText('Conversa prévia')).toBeInTheDocument();
  });

  it('mostra estado vazio quando não há conversas', () => {
    renderWithApp(chatRoutes(), { state: stateWithSession('adopter', 'a1'), route: '/matches' });
    expect(screen.getByText(/Nenhuma conversa ainda/)).toBeInTheDocument();
  });
});

describe('Chat', () => {
  it('mostra as mensagens e envia uma nova', async () => {
    renderWithApp(chatRoutes(), { state: stateWithSession('adopter', 'a3'), route: '/matches/match-a3-p2' });
    expect(screen.getByText('Oi, Julia! Vamos conversar sobre a Mia?')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Mensagem'), 'Posso visitar no sábado?');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));
    expect(screen.getByText('Posso visitar no sábado?')).toBeInTheDocument();
  });

  it('bloqueia o acesso de quem não participa do match', () => {
    renderWithApp(chatRoutes(), { state: stateWithSession('adopter', 'a1'), route: '/matches/match-a3-p2' });
    expect(screen.getByText('Conversa indisponível.')).toBeInTheDocument();
  });

  it('permite que a ONG aprove para adoção e conclua', async () => {
    renderWithApp(chatRoutes(), { state: stateWithSession('ong', 'ong1'), route: '/matches/match-a3-p2' });
    await userEvent.click(screen.getByRole('button', { name: 'Aprovar para adoção' }));
    expect(screen.getByText('Etapa: Aprovado para adoção')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Marcar como adotado' }));
    expect(screen.getByText('Etapa: Adotado')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Aprovar para adoção' })).not.toBeInTheDocument();
  });

  it('não oferece ações de aprovação ao adotante, apenas desistir', async () => {
    renderWithApp(chatRoutes(), { state: stateWithSession('adopter', 'a3'), route: '/matches/match-a3-p2' });
    expect(screen.queryByRole('button', { name: 'Aprovar para adoção' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Desistir da adoção' }));
    expect(screen.getByText('Etapa: Desistiu')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- --run src/screens/chat.test.tsx`
Expected: FAIL, módulos não encontrados.

- [ ] **Step 3: Implementar Matches**

Criar `src/screens/Matches.tsx`:

```tsx
// Lista as conversas do usuário atual, uma por match.
import { Link } from 'react-router-dom';
import { stageLabel } from '../domain/labels';
import { useApp } from '../state/context';

export function Matches() {
  const { state } = useApp();
  const session = state.session;

  const mine = state.matches.filter((m) =>
    session?.role === 'adopter' ? m.adopterId === session.userId : m.ongId === session?.userId,
  );

  return (
    <section>
      <h1>Conversas</h1>
      {mine.length === 0 && <p className="empty">Nenhuma conversa ainda. Ela abre depois do match.</p>}
      {mine.map((m) => {
        const pet = state.pets.find((p) => p.id === m.petId);
        const adopter = state.adopters.find((a) => a.id === m.adopterId);
        const title = session?.role === 'adopter' ? pet?.name : adopter?.name;
        const subtitle = session?.role === 'adopter' ? `ONG ${state.ongs.find((o) => o.id === m.ongId)?.name ?? ''}` : `Pet ${pet?.name ?? ''}`;
        return (
          <Link key={m.id} className="list-item" to={`/matches/${m.id}`}>
            <strong>{title}</strong>
            <div className="muted">{subtitle}</div>
            <div className="chip">{stageLabel[m.stage]}</div>
          </Link>
        );
      })}
    </section>
  );
}
```

- [ ] **Step 4: Implementar Chat**

Criar `src/screens/Chat.tsx`:

```tsx
// Conversa prévia de um match, com painel do processo de adoção.
import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { stageLabel } from '../domain/labels';
import { canAdvance } from '../domain/matching';
import { useApp } from '../state/context';

export function Chat() {
  const { matchId } = useParams();
  const { state, dispatch } = useApp();
  const [text, setText] = useState('');
  const session = state.session;

  const match = state.matches.find((m) => m.id === matchId);
  const participates =
    match && session && (session.role === 'adopter' ? match.adopterId === session.userId : match.ongId === session.userId);

  if (!match || !session || !participates) return <p className="empty">Conversa indisponível.</p>;

  const pet = state.pets.find((p) => p.id === match.petId);
  const adopter = state.adopters.find((a) => a.id === match.adopterId);
  const messages = state.messages.filter((m) => m.matchId === match.id);
  const isOng = session.role === 'ong';

  const send = (event: FormEvent) => {
    event.preventDefault();
    dispatch({ type: 'sendMessage', matchId: match.id, from: session.role, text, now: Date.now() });
    setText('');
  };

  return (
    <section>
      <Link to="/matches" className="link-button">Voltar</Link>
      <h1>{isOng ? adopter?.name : pet?.name}</h1>
      <p className="muted">{isOng ? `Sobre o pet ${pet?.name}` : `Conversa com a ONG sobre ${pet?.name}`}</p>

      <div className="stage-panel">
        <p>Etapa: {stageLabel[match.stage]}</p>
        {isOng && canAdvance(match.stage, 'aprovado_para_adocao') && (
          <button type="button" onClick={() => dispatch({ type: 'setStage', matchId: match.id, stage: 'aprovado_para_adocao' })}>
            Aprovar para adoção
          </button>
        )}
        {isOng && canAdvance(match.stage, 'adotado') && (
          <button type="button" onClick={() => dispatch({ type: 'setStage', matchId: match.id, stage: 'adotado' })}>
            Marcar como adotado
          </button>
        )}
        {canAdvance(match.stage, 'desistiu') && (
          <button type="button" onClick={() => dispatch({ type: 'setStage', matchId: match.id, stage: 'desistiu' })}>
            {isOng ? 'Encerrar processo' : 'Desistir da adoção'}
          </button>
        )}
      </div>

      <div className="messages">
        {messages.map((m) => (
          <div key={m.id} className={m.from === session.role ? 'bubble bubble-mine' : 'bubble'}>
            {m.text}
          </div>
        ))}
      </div>

      <form className="form" onSubmit={send}>
        <label htmlFor="mensagem">Mensagem</label>
        <input id="mensagem" type="text" value={text} onChange={(e) => setText(e.target.value)} />
        <button type="submit" className="primary">Enviar</button>
      </form>
    </section>
  );
}
```

- [ ] **Step 5: Registrar as rotas**

Em `src/App.tsx`, importar `Chat` e `Matches` e adicionar, dentro de `<Route element={<Shell />}>`, antes do fechamento:

```tsx
<Route path="matches" element={<Matches />} />
<Route path="matches/:matchId" element={<Chat />} />
```

Os imports:

```tsx
import { Chat } from './screens/Chat';
import { Matches } from './screens/Matches';
```

- [ ] **Step 6: Rodar e ver passar**

Run: `npm test -- --run && npx tsc -b && npm run lint`
Expected: PASS e sem erros.

- [ ] **Step 7: Commit**

```bash
git add src
git commit -m "Adiciona lista de conversas, chat e processo de adocao"
```

---

### Task 9: Perfil do adotante, cadastro e novo pet

**Files:**
- Create: `apps/web/src/screens/ProfileForm.tsx`, `apps/web/src/screens/NewPet.tsx`
- Modify: `apps/web/src/App.tsx`
- Test: `apps/web/src/screens/forms.test.tsx`

**Interfaces:**
- Consumes: `useApp`, `Action` `saveAdopter` e `addPet`, tipos `Adopter`, `Pet`.
- Produces: rotas `/cadastro` (perfil novo, sem sessão), `/adotante/perfil` (edição), `/ong/pets/novo`.

- [ ] **Step 1: Escrever os testes**

Criar `src/screens/forms.test.tsx`:

```tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { NewPet } from './NewPet';
import { ProfileForm } from './ProfileForm';
import { renderWithApp, stateWithSession } from '../test/render';

describe('ProfileForm', () => {
  it('cria um adotante novo com casa telada e entra no feed', async () => {
    renderWithApp(
      <Routes>
        <Route path="/cadastro" element={<ProfileForm />} />
        <Route path="/adotante" element={<p>Feed do adotante</p>} />
      </Routes>,
      { route: '/cadastro' },
    );
    await userEvent.type(screen.getByLabelText('Nome'), 'Paulo');
    await userEvent.clear(screen.getByLabelText('Idade'));
    await userEvent.type(screen.getByLabelText('Idade'), '33');
    await userEvent.type(screen.getByLabelText('Cidade'), 'Campinas');
    await userEvent.click(screen.getByLabelText('Casa telada'));
    await userEvent.click(screen.getByLabelText('Cão'));
    await userEvent.click(screen.getByRole('button', { name: 'Salvar perfil' }));
    expect(screen.getByText('Feed do adotante')).toBeInTheDocument();
  });

  it('exige nome e cidade', async () => {
    renderWithApp(<ProfileForm />, { route: '/cadastro' });
    await userEvent.click(screen.getByRole('button', { name: 'Salvar perfil' }));
    expect(screen.getByText('Informe seu nome.')).toBeInTheDocument();
    expect(screen.getByText('Informe sua cidade.')).toBeInTheDocument();
  });

  it('carrega o perfil existente para edição', () => {
    renderWithApp(<ProfileForm />, { state: stateWithSession('adopter', 'a1'), route: '/adotante/perfil' });
    expect(screen.getByLabelText('Nome')).toHaveValue('Marina');
    expect(screen.getByLabelText('Casa telada')).toBeChecked();
  });
});

describe('NewPet', () => {
  it('cadastra um pet da ONG e volta ao feed', async () => {
    renderWithApp(
      <Routes>
        <Route path="/ong/pets/novo" element={<NewPet />} />
        <Route path="/ong" element={<p>Feed da ONG</p>} />
      </Routes>,
      { state: stateWithSession('ong', 'ong1'), route: '/ong/pets/novo' },
    );
    await userEvent.type(screen.getByLabelText('Nome do pet'), 'Rex');
    await userEvent.type(screen.getByLabelText('Descrição'), 'Muito dócil.');
    await userEvent.click(screen.getByLabelText('Exige casa telada'));
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar pet' }));
    expect(screen.getByText('Feed da ONG')).toBeInTheDocument();
  });

  it('exige o nome do pet', async () => {
    renderWithApp(<NewPet />, { state: stateWithSession('ong', 'ong1'), route: '/ong/pets/novo' });
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar pet' }));
    expect(screen.getByText('Informe o nome do pet.')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- --run src/screens/forms.test.tsx`
Expected: FAIL, módulos não encontrados.

- [ ] **Step 3: Implementar ProfileForm**

Criar `src/screens/ProfileForm.tsx`:

```tsx
// Cadastro e edição do perfil do adotante, incluindo moradia, casa telada e preferências.
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { sizeLabel, speciesLabel, temperamentLabel } from '../domain/labels';
import type { Adopter, Size, Species, Temperament } from '../domain/types';
import { useApp } from '../state/context';

// Alterna um valor dentro de uma lista de preferências.
function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function ProfileForm() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const existing = state.adopters.find((a) => a.id === state.session?.userId && state.session?.role === 'adopter');

  const [name, setName] = useState(existing?.name ?? '');
  const [age, setAge] = useState(existing?.age ?? 18);
  const [city, setCity] = useState(existing?.city ?? '');
  const [housing, setHousing] = useState<Adopter['housing']>(existing?.housing ?? 'apartamento');
  const [screenedHome, setScreenedHome] = useState(existing?.screenedHome ?? false);
  const [hasYard, setHasYard] = useState(existing?.hasYard ?? false);
  const [otherPets, setOtherPets] = useState(existing?.otherPets ?? false);
  const [description, setDescription] = useState(existing?.description ?? '');
  const [species, setSpecies] = useState<Species[]>(existing?.preferences.species ?? []);
  const [sizes, setSizes] = useState<Size[]>(existing?.preferences.sizes ?? []);
  const [temperaments, setTemperaments] = useState<Temperament[]>(existing?.preferences.temperaments ?? []);
  const [errors, setErrors] = useState<{ name?: string; city?: string }>({});

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const found: { name?: string; city?: string } = {};
    if (!name.trim()) found.name = 'Informe seu nome.';
    if (!city.trim()) found.city = 'Informe sua cidade.';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const id = existing?.id ?? `a${state.adopters.length + 1}`;
    const adopter: Adopter = {
      id,
      name: name.trim(),
      age,
      city: city.trim(),
      housing,
      screenedHome,
      hasYard,
      otherPets,
      description: description.trim(),
      preferences: { species, sizes, temperaments },
    };
    dispatch({ type: 'saveAdopter', adopter });
    dispatch({ type: 'login', role: 'adopter', userId: id });
    navigate('/adotante');
  };

  return (
    <form className="form" onSubmit={submit} noValidate>
      <h1>{existing ? 'Seu perfil' : 'Criar perfil'}</h1>

      <label htmlFor="nome">Nome</label>
      <input id="nome" type="text" value={name} onChange={(e) => setName(e.target.value)} />
      {errors.name && <p className="muted" role="alert">{errors.name}</p>}

      <label htmlFor="idade">Idade</label>
      <input id="idade" type="number" min={18} value={age} onChange={(e) => setAge(Number(e.target.value))} />

      <label htmlFor="cidade">Cidade</label>
      <input id="cidade" type="text" value={city} onChange={(e) => setCity(e.target.value)} />
      {errors.city && <p className="muted" role="alert">{errors.city}</p>}

      <label htmlFor="moradia">Moradia</label>
      <select id="moradia" value={housing} onChange={(e) => setHousing(e.target.value as Adopter['housing'])}>
        <option value="apartamento">Apartamento</option>
        <option value="casa">Casa</option>
      </select>

      <label className="check"><input type="checkbox" checked={screenedHome} onChange={(e) => setScreenedHome(e.target.checked)} />Casa telada</label>
      <label className="check"><input type="checkbox" checked={hasYard} onChange={(e) => setHasYard(e.target.checked)} />Tenho quintal</label>
      <label className="check"><input type="checkbox" checked={otherPets} onChange={(e) => setOtherPets(e.target.checked)} />Tenho outros pets</label>

      <label htmlFor="descricao">Sobre você</label>
      <textarea id="descricao" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />

      <fieldset>
        <legend>Espécies de interesse</legend>
        {(Object.keys(speciesLabel) as Species[]).map((value) => (
          <label key={value} className="check">
            <input type="checkbox" checked={species.includes(value)} onChange={() => setSpecies(toggle(species, value))} />
            {speciesLabel[value]}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Portes de interesse</legend>
        {(Object.keys(sizeLabel) as Size[]).map((value) => (
          <label key={value} className="check">
            <input type="checkbox" checked={sizes.includes(value)} onChange={() => setSizes(toggle(sizes, value))} />
            {sizeLabel[value]}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Temperamentos de interesse</legend>
        {(Object.keys(temperamentLabel) as Temperament[]).map((value) => (
          <label key={value} className="check">
            <input type="checkbox" checked={temperaments.includes(value)} onChange={() => setTemperaments(toggle(temperaments, value))} />
            {temperamentLabel[value]}
          </label>
        ))}
      </fieldset>

      <button type="submit" className="primary">Salvar perfil</button>
    </form>
  );
}
```

- [ ] **Step 4: Implementar NewPet**

Criar `src/screens/NewPet.tsx`:

```tsx
// Cadastro de pet feito pela ONG, com os requisitos exigidos dos adotantes.
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { sizeLabel, speciesLabel, temperamentLabel } from '../domain/labels';
import type { Size, Species, Temperament } from '../domain/types';
import { useApp } from '../state/context';

export function NewPet() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const ongId = state.session?.userId ?? '';

  const [name, setName] = useState('');
  const [species, setSpecies] = useState<Species>('cao');
  const [size, setSize] = useState<Size>('medio');
  const [ageYears, setAgeYears] = useState(1);
  const [temperament, setTemperament] = useState<Temperament>('calmo');
  const [description, setDescription] = useState('');
  const [requiresScreenedHome, setRequiresScreenedHome] = useState(false);
  const [requiresYard, setRequiresYard] = useState(false);
  const [error, setError] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('Informe o nome do pet.');
      return;
    }
    dispatch({
      type: 'addPet',
      pet: {
        id: `p${state.pets.length + 1}`,
        ongId,
        name: name.trim(),
        species,
        size,
        ageYears,
        temperament,
        description: description.trim(),
        requiresScreenedHome,
        requiresYard,
        status: 'disponivel',
      },
    });
    navigate('/ong');
  };

  return (
    <form className="form" onSubmit={submit} noValidate>
      <h1>Novo pet</h1>

      <label htmlFor="pet-nome">Nome do pet</label>
      <input id="pet-nome" type="text" value={name} onChange={(e) => setName(e.target.value)} />
      {error && <p className="muted" role="alert">{error}</p>}

      <label htmlFor="pet-especie">Espécie</label>
      <select id="pet-especie" value={species} onChange={(e) => setSpecies(e.target.value as Species)}>
        {(Object.keys(speciesLabel) as Species[]).map((v) => <option key={v} value={v}>{speciesLabel[v]}</option>)}
      </select>

      <label htmlFor="pet-porte">Porte</label>
      <select id="pet-porte" value={size} onChange={(e) => setSize(e.target.value as Size)}>
        {(Object.keys(sizeLabel) as Size[]).map((v) => <option key={v} value={v}>{sizeLabel[v]}</option>)}
      </select>

      <label htmlFor="pet-idade">Idade em anos</label>
      <input id="pet-idade" type="number" min={0} value={ageYears} onChange={(e) => setAgeYears(Number(e.target.value))} />

      <label htmlFor="pet-temperamento">Temperamento</label>
      <select id="pet-temperamento" value={temperament} onChange={(e) => setTemperament(e.target.value as Temperament)}>
        {(Object.keys(temperamentLabel) as Temperament[]).map((v) => <option key={v} value={v}>{temperamentLabel[v]}</option>)}
      </select>

      <label htmlFor="pet-descricao">Descrição</label>
      <textarea id="pet-descricao" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />

      <label className="check"><input type="checkbox" checked={requiresScreenedHome} onChange={(e) => setRequiresScreenedHome(e.target.checked)} />Exige casa telada</label>
      <label className="check"><input type="checkbox" checked={requiresYard} onChange={(e) => setRequiresYard(e.target.checked)} />Exige quintal</label>

      <button type="submit" className="primary">Cadastrar pet</button>
    </form>
  );
}
```

- [ ] **Step 5: Registrar as rotas**

Em `src/App.tsx`, importar `NewPet` e `ProfileForm` e ajustar as rotas: `cadastro` fica fora dos blocos protegidos, `adotante/perfil` dentro do bloco do adotante e `ong/pets/novo` dentro do bloco da ONG:

```tsx
<Route path="cadastro" element={<ProfileForm />} />
<Route element={<RequireRole role="adopter" />}>
  <Route path="adotante" element={<AdopterFeed />} />
  <Route path="adotante/perfil" element={<ProfileForm />} />
</Route>
<Route element={<RequireRole role="ong" />}>
  <Route path="ong" element={<OngFeed />} />
  <Route path="ong/pets/novo" element={<NewPet />} />
</Route>
```

- [ ] **Step 6: Rodar e ver passar**

Run: `npm test -- --run && npx tsc -b && npm run lint && npm run build`
Expected: PASS, sem erros, build conclui.

- [ ] **Step 7: Verificar o fluxo completo no navegador**

Run: `npm run dev` e abrir a URL exibida. Conferir manualmente:

1. Entrar como Marina, arrastar o card do Thor para a direita com o mouse: o card sai e aparece a Nina. Arrastar para a esquerda: o card sai.
2. Tocar (clicar sem arrastar) na foto: abre o detalhe.
3. Sair, entrar como Patas do Bem: aparecem Carlos e Julia, e também Marina se curtiu o Thor. Aceitar Marina: aparece "Deu match".
4. Abrir a conversa, enviar mensagem, aprovar para adoção e marcar como adotado.
5. Entrar como Marina de novo: a conversa aparece com a etapa atual.
6. Recarregar a página: o estado persiste. "Restaurar dados de demonstração" volta ao início.
7. Reduzir a largura da janela para 375 px: nada estoura na horizontal.

Corrigir qualquer falha encontrada antes de seguir.

- [ ] **Step 8: Commit**

```bash
git add src
git commit -m "Adiciona perfil do adotante, cadastro e novo pet"
```

---

### Task 10: PWA, publicação no GitHub Pages e documentação

**Files:**
- Create: `apps/web/public/icon.svg`, `apps/web/pwa-assets.config.ts`, `.github/workflows/pages.yml`
- Modify: `apps/web/vite.config.ts`, `apps/web/index.html`, `.github/workflows/ci.yml`, `README.md`, `docs/superpowers/specs/2026-09-20-tinder-pet-design.md`

**Interfaces:**
- Consumes: aplicativo construído nas tarefas anteriores.
- Produces: manifesto PWA, service worker, ícones e workflow de publicação em `https://7genesis.github.io/tinder-pet/`.

- [ ] **Step 1: Criar o ícone e gerar os ativos do PWA**

Criar `apps/web/public/icon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#e8590c"/>
  <ellipse cx="256" cy="330" rx="96" ry="78" fill="#ffffff"/>
  <ellipse cx="150" cy="230" rx="38" ry="52" fill="#ffffff"/>
  <ellipse cx="220" cy="170" rx="38" ry="52" fill="#ffffff"/>
  <ellipse cx="292" cy="170" rx="38" ry="52" fill="#ffffff"/>
  <ellipse cx="362" cy="230" rx="38" ry="52" fill="#ffffff"/>
</svg>
```

Criar `apps/web/pwa-assets.config.ts`:

```ts
// Gera os ícones PNG do PWA a partir do SVG de origem.
import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

export default defineConfig({
  preset: minimal2023Preset,
  images: ['public/icon.svg'],
});
```

Run: `npx pwa-assets-generator`
Expected: arquivos `pwa-64x64.png`, `pwa-192x192.png`, `pwa-512x512.png`, `maskable-icon-512x512.png`, `apple-touch-icon-180x180.png` e `favicon.ico` criados em `public/`.

- [ ] **Step 2: Configurar o plugin PWA**

Em `apps/web/vite.config.ts`, importar `VitePWA` de `vite-plugin-pwa` e substituir a lista de plugins:

```ts
import { VitePWA } from 'vite-plugin-pwa';
```

```ts
plugins: [
  react(),
  VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png'],
    manifest: {
      name: 'Tinder Pet',
      short_name: 'Tinder Pet',
      description: 'Adoção de pets com match entre adotantes e ONGs.',
      lang: 'pt-BR',
      theme_color: '#e8590c',
      background_color: '#fafaf9',
      display: 'standalone',
      start_url: '.',
      scope: '.',
      icons: [
        { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
        { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
  }),
],
```

Em `apps/web/index.html`, ajustar `<html lang="pt-BR">`, `<title>Tinder Pet</title>` e garantir a tag de viewport e o tema:

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="theme-color" content="#e8590c" />
<link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png" />
```

- [ ] **Step 3: Construir com a base do GitHub Pages e conferir**

Run: `VITE_BASE=/tinder-pet/ npm run build && ls dist | head -20`
Expected: build conclui e `dist` contém `manifest.webmanifest`, `sw.js` e os ícones.

Run: `VITE_BASE=/tinder-pet/ npx vite preview --port 4173` e abrir `http://localhost:4173/tinder-pet/`.
Expected: aplicativo carrega sem erros no console e o navegador oferece instalar o app.

- [ ] **Step 4: Criar o workflow de publicação**

Criar `.github/workflows/pages.yml`:

```yaml
# Publica o protótipo web no GitHub Pages a cada push na main que altere o front.
name: Publicar prototipo

on:
  push:
    branches: [main]
    paths:
      - 'apps/web/**'
      - '.github/workflows/pages.yml'
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    name: Construir
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - uses: actions/setup-node@v5
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: apps/web/package-lock.json

      - name: Instalar dependências
        run: npm ci
        working-directory: apps/web

      - name: Testes
        run: npm test -- --run
        working-directory: apps/web

      - name: Build com a base do repositório
        run: npm run build
        working-directory: apps/web
        env:
          VITE_BASE: /tinder-pet/

      - uses: actions/upload-pages-artifact@v4
        with:
          path: apps/web/dist

  deploy:
    name: Publicar
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Em `.github/workflows/ci.yml`, trocar `actions/checkout@v4` por `actions/checkout@v5` e `actions/setup-node@v4` por `actions/setup-node@v5`.

- [ ] **Step 4b: Registrar o protótipo na documentação**

Em `README.md`, acrescentar antes de "Ambiente local":

```markdown
## Protótipo

O protótipo web roda sem backend, com dados fictícios, e fica em `apps/web`.

```bash
cd apps/web
npm install
npm run dev
```

Publicado em https://7genesis.github.io/tinder-pet/
```

Em `docs/superpowers/specs/2026-09-20-tinder-pet-design.md`, na tabela de cronograma, trocar a linha da Sprint 2 por:

```markdown
| 2 | Out 2026 | Protótipo web com dados fictícios (swipe, match, chat) publicado no GitHub Pages, depois auth, ONGs e cadastro de pets na API |
```

- [ ] **Step 5: Verificar tudo e commitar**

Run: `npm test -- --run && npx tsc -b && npm run lint && VITE_BASE=/tinder-pet/ npm run build`
Expected: tudo passa.

```bash
cd ../..
grep -rnP '[\x{2014}\x{2013}]' apps/web/src README.md .github docs || echo "sem travessoes"
git add -A
git commit -m "Adiciona PWA e publicacao do prototipo no GitHub Pages"
```

- [ ] **Step 6: Habilitar o GitHub Pages e publicar (pede autorização do usuário)**

Estas ações mexem no repositório remoto. Perguntar ao usuário antes de executar:

1. Autorização para o `git push`.
2. Autorização para habilitar o Pages com origem em GitHub Actions:

```bash
gh api -X POST repos/7Genesis/tinder-pet/pages -f build_type=workflow
```

Depois do push, acompanhar com `gh run watch` e abrir `https://7genesis.github.io/tinder-pet/`. Confirmar que o login, o swipe e o chat funcionam na URL publicada.
