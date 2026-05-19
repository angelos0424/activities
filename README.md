# Activities

Activity and idea tracking workspace.

## Scaffold

This repository is scaffolded for the stack reviewed from GitHub issue #4:

- Frontend: React + Vite, ready for Tailwind CSS and shadcn/ui-style components
- Mobile packaging path: Capacitor config for a later Android build
- Backend: Java Spring Boot REST API scaffold
- Data: PostgreSQL with pgvector, initialized through Flyway SQL migrations
- Local infra: Docker Compose for the database

## Project layout

```text
.
├── backend/                 # Spring Boot API scaffold
├── frontend/                # React/Vite client scaffold
├── docs/                    # Review notes and architecture decisions
└── docker-compose.yml       # Local PostgreSQL + pgvector
```

## Local development

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
