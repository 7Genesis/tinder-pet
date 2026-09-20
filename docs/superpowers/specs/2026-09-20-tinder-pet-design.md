# Tinder Pet: Documento de Design

Data: 20/09/2026
Projeto: plataforma de adoção de pets para ONGs, com descoberta por swipe, match duplo e chat.
Repositório: https://github.com/7Genesis/tinder-pet

## 1. Objetivo

Conectar adotantes a pets de várias ONGs. O adotante desliza pets, a ONG desliza adotantes que curtiram seus pets, e quando os dois curtem ocorre o match. Após o match abre um chat para a conversa prévia obrigatória antes da adoção.

## 2. Decisões de escopo

| Tema | Decisão |
|---|---|
| Plataforma | PWA responsivo, sem app nativo |
| Frontend | React com TypeScript |
| Backend | NestJS em monólito modular, TypeScript |
| Banco | PostgreSQL com migrations versionadas |
| Tempo real | Redis e Socket.IO com adapter Redis |
| Fotos | Armazenamento compatível com S3, com redimensionamento |
| ONGs | Várias ONGs (multi tenant), com aprovação pelo admin da plataforma |
| Recusa | Card recusado some e volta ao feed após 30 dias |
| Prazo | Entrega final em dezembro de 2026 |

Fora de escopo: app nativo, microsserviços, pagamentos, login social (candidato a evolução).

## 3. Atores

1. Adotante: cria perfil com preferências e desliza pets.
2. Membro da ONG: cadastra pets, desliza adotantes e conversa. Nível admin da ONG (gerencia equipe e perfil) ou voluntário (opera pets e matches).
3. Admin da plataforma: aprova ONGs novas e modera denúncias.

## 4. Modelo de dados

| Entidade | Campos principais |
|---|---|
| usuario | e-mail, senha com Argon2, papel, consentimento LGPD, e-mail confirmado |
| ong | nome, CNPJ, cidade, status de aprovação |
| membro_ong | usuario, ong, nível |
| perfil_adotante | moradia, casa telada, quintal, altura do muro, outros pets, crianças, horas sozinho por dia, cidade e região, preferências |
| pet | ong, espécie, porte, idade, temperamento, saúde, fotos, requisitos, status |
| decisao_adotante | adotante, pet, direção (direita ou esquerda), data |
| decisao_ong | membro, adotante, pet, direção, data |
| match | adotante, pet, ong, estado do processo |
| conversa e mensagem | ligadas ao match, com estado de leitura |
| entrevista | match, resultado, observações da ONG |
| denuncia | autor, alvo, motivo, status |

Regras de integridade:

1. Decisões têm restrição de unicidade por par, para que clique duplo ou requisição repetida não duplique swipes.
2. O match é criado em transação, para que swipes simultâneos não gerem match duplicado.
3. O banco garante um único processo ativo por pet.
4. Toda consulta de uma ONG é filtrada pelo ong_id do membro autenticado, no backend.

## 5. Perfil do adotante

Campos que alimentam requisitos e compatibilidade: tipo de moradia, casa telada (janelas, varandas e portas com tela de proteção), quintal e altura do muro, outros pets, crianças, horas sozinho por dia, cidade e região, preferências de espécie, porte, idade e temperamento. O endereço exato nunca é armazenado nem exposto. A ONG vê só cidade e região.

## 6. Descoberta e compatibilidade

1. Requisitos duros do pet, definidos pela ONG (por exemplo exige tela de proteção, exige quintal). Quem não atende não vê o pet.
2. Preferências suaves do adotante ordenam o feed por pontuação de 0 a 100, com pesos por critério.
3. O card mostra os motivos da compatibilidade.
4. A recusa (esquerda) remove o card e ele pode reaparecer após 30 dias.

## 7. Swipe e match

Adotante:

1. Direita curte e esquerda passa. Botões equivalentes ficam na tela para acessibilidade.
2. Tocar na foto abre o detalhe do pet: descrição, saúde, temperamento, requisitos e ONG.

ONG:

1. Vê apenas adotantes que curtiram um pet da própria ONG, com o pet indicado no card.
2. Direita aceita e esquerda recusa. Tocar na foto abre o perfil completo do adotante.

Regra do match: nasce quando adotante e ONG deslizam para a direita no mesmo par adotante e pet. Recusas não são comunicadas ao outro lado. Ambos recebem notificação do match.

## 8. Processo de adoção

Estados do match:

1. match criado.
2. conversa_previa: o chat abre e a ONG realiza a entrevista, registrando o resultado.
3. aprovado_para_adocao: somente a ONG libera, e apenas após entrevista aprovada. O pet passa a em processo.
4. adotado ou desistiu: o pet fica adotado ou volta a disponível.

O chat só pode ser aberto a partir de um match. Essa regra é validada no backend.

## 9. Autenticação, segurança e LGPD

Autenticação:

1. Cadastro com e-mail e senha e confirmação de e-mail antes do uso.
2. Senhas com Argon2, token de acesso de 15 minutos e refresh token rotacionado e revogável.
3. Recuperação de senha por link de uso único e validade curta.

ONGs: cadastro fica pendente até aprovação do admin da plataforma, com conferência de CNPJ e documentos.

Proteções:

1. Limite de tentativas de login e de swipes por minuto.
2. Validação de toda entrada. Upload limitado a tipos e tamanhos permitidos, com remoção de EXIF.
3. Cada rota verifica papel e ong_id no backend.
4. Denunciar perfil, pet e mensagem. Bloquear usuário no chat.

LGPD:

1. Consentimento explícito e política de privacidade no cadastro.
2. Exportação de dados e exclusão de conta, com anonimização de perfil, fotos e mensagens.
3. Coleta mínima de dados sensíveis.

## 10. Infraestrutura, qualidade e operação

1. Docker Compose sobe API, front, PostgreSQL e Redis com um comando.
2. GitHub Actions executa lint, testes e build a cada pull request.
3. Testes unitários, de integração e ponta a ponta. Cobertura mínima nas regras de match, isolamento entre ONGs e estados do processo.
4. Logs estruturados, health checks e rotina de backup do banco.
5. Variáveis sensíveis fora do repositório, com arquivo de exemplo versionado.

## 11. Organização do repositório

```
tinder-pet/
  apps/
    api/          NestJS
    web/          React PWA
  docs/           documentação, épicos, features, requisitos, regras de negócio
  docker-compose.yml
  .github/workflows/
```

Módulos da API: auth, usuarios, ongs, pets, descoberta, match, chat, moderacao.

## 12. Cronograma

| Sprint | Período | Entregas |
|---|---|---|
| 1 | Set 2026 | Requisitos, épicos, features, este design, esqueleto do repositório, CI |
| 2 | Out 2026 | Auth, ONGs e aprovação, cadastro de pets, perfil do adotante, feed com swipe |
| 3 | Nov 2026 | Match duplo, processo de adoção, chat em tempo real, notificações, denúncias |
| 4 | Dez 2026 | Testes finais, LGPD completa, desempenho, estabilização e apresentação |

## 13. Riscos

| Risco | Mitigação |
|---|---|
| Escopo grande para o prazo | Entregar por sprint, com o fluxo de match completo antes de recursos extras |
| Golpes usando pets | Aprovação de ONG e denúncias |
| Mensagens perdidas ao escalar | Redis adapter no Socket.IO e persistência das mensagens no banco |
| Vazamento entre ONGs | Filtro por ong_id no backend e testes dedicados de isolamento |
