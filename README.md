# Activities

Activities is currently scoped as a Discord bot MVP for work automation.

## Current MVP Goal

The MVP goal is a work automation bot used through slash commands in a specific
Discord channel. The bot should keep the first release focused on Discord-native
workflows: users invoke commands in the configured channel, the bot performs the
requested automation, and responses are returned in Discord.

Web UI and frontend product work are out of scope for the current MVP. Existing
web/client scaffolding is retained as repository context, but it is deferred and
should not be treated as the active product goal.

## Existing Scaffold

This repository is scaffolded for the stack reviewed from GitHub issue #4:

- Frontend: React + Vite, ready for Tailwind CSS and shadcn/ui-style components
- Mobile packaging path: Capacitor config for a later Android build
- Backend: Java Spring Boot REST API scaffold
- Data: PostgreSQL with pgvector, initialized through Flyway SQL migrations
- Local infra: Docker Compose for the database
- Product requirements: see `docs/prd.md`

## Project layout

```text
.
├── backend/                 # Spring Boot API scaffold
├── frontend/                # React/Vite client scaffold
├── docs/                    # Review notes and architecture decisions
└── docker-compose.yml       # Local PostgreSQL + pgvector
```

## Local development

The commands below describe the existing scaffold only. They are not the current
MVP delivery path while the project is focused on the Discord bot.

Start the database:

```bash
docker compose up -d db
```

Run the frontend:

```bash
cd frontend
npm install
npm run dev
```

Run the backend from an environment with Java 21 and Maven:

```bash
cd backend
mvn spring-boot:run
```
