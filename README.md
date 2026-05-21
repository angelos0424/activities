# Activities

Activities is currently scoped as an SNS 업무 자동화 Discord bot MVP.

## Current MVP goal

The MVP goal is a 업무 자동화 bot used through slash commands in a specific Discord channel. The bot should let users trigger small automation workflows from Discord without opening a separate web application.

Web UI and frontend work are out of scope for the current MVP and are deferred. Existing frontend/backend scaffold files remain in the repository as historical setup work, but they are not the active MVP target.

## Existing scaffold

This repository is scaffolded for the stack reviewed from GitHub issue #4:

- Frontend: React + Vite, currently deferred for this MVP
- Mobile packaging path: Capacitor config, currently deferred for this MVP
- Backend: Java Spring Boot REST API scaffold, retained for possible automation/API support
- Data: PostgreSQL with pgvector, initialized through Flyway SQL migrations, retained for workflows that need persistence/search
- Local infra: Docker Compose for the database, retained for local persistence support
- Product requirements: see `docs/prd.md`

## Project layout

```text
.
├── backend/                 # Spring Boot API scaffold
├── frontend/                # React/Vite client scaffold, deferred for current MVP
├── docs/                    # Review notes and architecture decisions
└── docker-compose.yml       # Local PostgreSQL + pgvector
```

## Existing scaffold local development

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
