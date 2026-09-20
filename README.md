# Tinder Pet

Plataforma de adoção de pets para ONGs. O adotante desliza pets, a ONG desliza adotantes que curtiram seus pets, e quando os dois curtem ocorre o match e abre um chat para a conversa prévia à adoção.

## Stack

React com TypeScript (PWA), NestJS, PostgreSQL, Redis e Socket.IO.

## Estrutura

```
apps/api     API em NestJS
apps/web     Frontend em React
docs         Documentação e design
```

O design completo está em `docs/superpowers/specs/2026-09-20-tinder-pet-design.md`.

## Ambiente local

Copie `.env.example` para `.env`, ajuste os valores e suba os serviços de apoio:

```bash
cp .env.example .env
docker compose up -d
```
