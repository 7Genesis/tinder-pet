# Tinder Pet

Plataforma de adoção de pets para ONGs. O adotante desliza pets, a ONG desliza adotantes que curtiram seus pets, e quando os dois curtem ocorre o match e abre um chat para a conversa prévia à adoção.

Demo publicada: https://7genesis.github.io/tinder-pet/

Ideia original de Genesis Melo e José Marcos da Silva.

## O problema

ONGs de proteção animal recebem muitos interessados, mas poucos estão prontos para adotar: falta tela de proteção em janelas, não há espaço para um cão grande, o temperamento do bicho não combina com a rotina. A triagem acontece em conversas soltas, uma a uma. Do lado de quem quer adotar, é difícil saber quais animais de quais ONGs realmente cabem na sua casa.

A ideia do projeto é tornar essa triagem parte do produto:

1. A ONG define requisitos para cada pet (por exemplo, exige casa telada).
2. O adotante só vê pets cujos requisitos ele atende, ordenados por compatibilidade.
3. A ONG só avalia adotantes que já demonstraram interesse em um pet dela.
4. Só o interesse dos dois lados abre a conversa, e a adoção segue um processo com etapas.

## Estado do projeto

Protótipo. Só existe o front-end, rodando no navegador com dados fictícios. Não há servidor, banco de dados, autenticação real nem tempo real.

| Parte | Estado |
|---|---|
| `apps/web`, protótipo do fluxo completo | Implementado, com testes |
| `apps/api`, API em NestJS | Não iniciada (a pasta só tem um `.gitkeep`) |
| PostgreSQL, Redis, Socket.IO | Só o `docker-compose.yml` dos serviços de apoio; nenhum código os usa ainda |
| Documento de design e plano | Escritos em `docs/` |

O desenvolvimento foi concentrado em setembro de 2026 (primeiro commit em 20/09, último na mesma data). O cronograma do documento de design prevê API, chat em tempo real e demais itens para outubro a dezembro de 2026.

## O que o protótipo faz hoje

Telas e rotas (React Router):

| Rota | Quem | O que faz |
|---|---|---|
| `/` | todos | Login simulado: escolhe um adotante ou uma ONG de demonstração |
| `/cadastro` | novo adotante | Cria um perfil de adotante |
| `/adotante` | adotante | Feed de pets, um por vez, com swipe ou botões |
| `/adotante/perfil` | adotante | Edita o perfil e as preferências |
| `/ong` | ONG | Fila de adotantes que curtiram pets da ONG |
| `/ong/pets/novo` | ONG | Cadastra um pet |
| `/matches` | ambos | Lista de conversas, uma por match |
| `/matches/:matchId` | ambos | Chat e painel do processo de adoção |

Comportamento implementado no código:

- Swipe com ponteiro (arrastar 100 px ou mais decide; toque curto abre o detalhe) e botões equivalentes.
- Requisitos duros: o adotante não vê pets que exigem casa telada ou quintal se o perfil dele não atende.
- Compatibilidade de 0 a 100 com pesos fixos (espécie 40, porte 30, temperamento 30). Lista de preferência vazia conta como "sem preferência". O card mostra os motivos.
- Recusa esconde o card por 30 dias; curtida esconde para sempre.
- Match duplo: só nasce quando adotante e ONG curtem o mesmo par adotante e pet. O id é determinístico, então não duplica.
- Processo de adoção com estados `conversa_previa`, `aprovado_para_adocao`, `adotado` e `desistiu`. A ONG aprova e marca como adotado; os dois lados podem desistir. Um pet só pode ter um processo ativo por vez, e o status do pet acompanha o estado.
- Chat por match, aberto apenas para os dois participantes. As mensagens ficam só no estado local.
- PWA instalável (manifesto e service worker via `vite-plugin-pwa`).
- Estado salvo no `localStorage`; o botão "Restaurar dados de demonstração" volta ao início.

Dados de demonstração: 2 ONGs, 6 pets, 4 adotantes e uma conversa já aberta (Julia e Mia).

## Decisões técnicas

- **Regras de negócio em funções puras** (`src/domain`). Compatibilidade, match, fila da ONG, feed e transições de estado não dependem de React nem de relógio, o que as torna fáceis de testar e de portar para a API depois.
- **Reducer único com Context** (`src/state`). O estado inteiro é um objeto serializável e todas as mudanças passam por ações. Evita uma biblioteca de estado para um protótipo e deixa o `localStorage` trivial (serializa o estado todo).
- **Hora injetada nas regras.** As funções recebem `now`, e só `clock.ts` lê `Date.now()`. Por isso a regra dos 30 dias é testável sem manipular o relógio.
- **Match com id determinístico** (`match-<adotante>-<pet>`): a mesma regra de unicidade por par que o design pede ao banco, aqui garantida no reducer.
- **Dois conjuntos de decisões** (adotante e ONG), em vez de um só. Cada lado decide de forma independente e a recusa de um lado não é comunicada ao outro.
- **Gesto de swipe com Pointer Events**, sem biblioteca, com botões equivalentes na tela por acessibilidade.
- **Vite, React 19 e TypeScript** no front, com Vitest e Testing Library. A base da URL vem de `VITE_BASE` para funcionar no subcaminho do GitHub Pages.
- **Publicação automática**: a cada push na `main` que mude `apps/web`, o workflow roda os testes, faz o build e publica no GitHub Pages.

A arquitetura planejada (NestJS em monólito modular, PostgreSQL com migrations, Redis com Socket.IO, multi tenant por ONG, LGPD) está descrita em `docs/superpowers/specs/2026-09-20-tinder-pet-design.md`. É um plano, não código existente.

## Como rodar

Requer Node.js 22 (versão usada na CI).

```bash
cd apps/web
npm install
npm run dev
```

Outros scripts em `apps/web`:

```bash
npm test -- --run   # testes uma vez
npm run lint        # oxlint
npm run build       # tsc -b e vite build
npm run preview     # serve o build
```

Os serviços de apoio (PostgreSQL 16 e Redis 7) ainda não são usados pelo protótipo, mas o compose já existe:

```bash
cp .env.example .env
docker compose up -d
```

## Testes

Há 10 arquivos de teste em `apps/web/src`, com 67 testes: regras de compatibilidade e de match, reducer, gesto de swipe, dados de demonstração, cards, feeds, formulários e chat. A CI (`.github/workflows/ci.yml`) roda lint, testes e build do `apps/web` a cada push e pull request na `main`, e valida o `docker-compose.yml`.

Não há testes de ponta a ponta nem da API (que ainda não existe).

## O que falta

- API em NestJS: autenticação, ONGs com aprovação, pets, descoberta, match e chat persistidos.
- Banco de dados e isolamento entre ONGs no backend.
- Chat em tempo real e notificações de match.
- Upload de fotos (os cards do protótipo mostram um ícone de cão ou gato no lugar da foto).
- Entrevista registrada pela ONG antes de aprovar a adoção, denúncias e bloqueio, e itens de LGPD previstos no design.
- Perfil do adotante mais completo (crianças, horas sozinho, altura do muro, região), previsto no design.
- Testes de integração e ponta a ponta.

## Estrutura

```
apps/api     API em NestJS (ainda vazia)
apps/web     Protótipo em React
docs         Design e plano de implementação do protótipo
```
