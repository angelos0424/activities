# Activities

Activities is currently scoped as an SNS 업무 자동화 Discord bot MVP.

## Current MVP Goal

The active MVP is a Discord bot operated through slash commands in configured
Discord channels. The goal is to prove the cheapest useful workflow first:
users should trigger small automation tasks from Discord without opening or
maintaining a separate web application.

The earlier web app, OCR-first receipt flow, meeting transcript analysis, and
browser report screens are preserved as deferred legacy scope in `docs/prd.md`
and `TODOS.md`. They are not part of the current execution queue unless a future
issue explicitly reactivates them.

## Existing Scaffold

This repository is scaffolded for the stack reviewed from GitHub issue #4:

- Frontend: React + Vite, deferred for the current MVP
- Mobile packaging path: Capacitor config, deferred for the current MVP
- Backend: Java Spring Boot REST API scaffold, retained for automation/API support
- Data: PostgreSQL with pgvector, retained for workflows that need persistence/search
- Local infra: Docker Compose for the database
- Product requirements: see `docs/prd.md`

## Project layout

```text
.
├── backend/                 # Spring Boot API scaffold, retained for automation/API support
├── frontend/                # React/Vite client scaffold, deferred for current MVP
├── docs/                    # Review notes and architecture decisions
└── docker-compose.yml       # Local PostgreSQL + pgvector
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
