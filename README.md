# Activities

Activities is currently scoped as a local Discord bot MVP for NGO/small-group
operations work.

## Current MVP Goal

The active MVP is a Discord bot operated through slash commands in configured
Discord channels. The goal is to prove the cheapest useful workflow first:
users should trigger small automation tasks from Discord without opening or
maintaining a separate web application.

The active service channels are:

| Channel | Service |
| --- | --- |
| `#sns` | `sns-manager` |
| `#receipt` | `receipt-manager` |
| `#todo` | `todo-manager` |

The earlier web app, OCR-first receipt flow, meeting transcript analysis, and
browser report screens are deferred unless a future issue explicitly
reactivates them.

## Existing Scaffold

This repository is scaffolded for the stack reviewed from GitHub issue #4:

- Frontend: React + Vite, deferred for the current MVP.
- Mobile packaging path: Capacitor config, deferred for the current MVP.
- Backend: Java Spring Boot REST API scaffold, retained for automation/API support.
- Data: PostgreSQL with pgvector, retained for workflows that need persistence/search.
- Local infra: Docker Compose for the Discord bot and database.
- Discord bot skeleton: `sns/`.

## Product Documents

- Product requirements index: `docs/prd.md`.
- Per-service PRDs: `docs/prd-sns.md`, `docs/prd-receipts.md`, `docs/prd-todo.md`.
- Discord bot MVP requirements: `docs/requirements/discord-bot-mvp.md`.
- MVP tech stack: `docs/tech-stack.md`.
- Discord command contract: `docs/discord-command-spec.md`.
- Data schema: `docs/data-schema.md`.
- Implementation roadmap and TODO index: `TODOS.md`.

## Project layout

```text
.
├── backend/                 # Spring Boot API scaffold, retained for automation/API support
├── frontend/                # React/Vite client scaffold, deferred for current MVP
├── docs/                    # PRDs, requirements, review notes, and architecture decisions
├── sns/                     # Discord bot skeleton workspace
├── TODOS.md                 # Cross-service implementation roadmap and TODO index
└── docker-compose.yml       # Local Discord bot + PostgreSQL/pgvector
```

## Local Development

Run the Discord bot in Docker:

```bash
cp sns/.env.example sns/.env
docker compose up --build bot
```

Register Discord slash commands from the bot image:

```bash
docker compose run --rm bot npm run register-commands:prod
```

## Existing Scaffold Local Development

Start the database:

```bash
docker compose up -d db
```

Run the deferred frontend scaffold:

```bash
cd frontend
npm install
npm run dev
```

Run the backend scaffold from an environment with Java 21 and Maven:

```bash
cd backend
mvn spring-boot:run
```
