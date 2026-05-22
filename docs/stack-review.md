# Stack Review

> Legacy note: this review came from the earlier accounting/meeting transcript scope.
> Current MVP direction is the local Discord bot stack in `docs/tech-stack.md`.

Source: GitHub issue #4 attachment `ExportBlock-bd73c755-7d8a-4bb8-83b2-54b696c1157b.zip`.

## Verdict

The proposed stack is valid for the requested accounting and meeting workflows:

- React + Vite is a pragmatic web client foundation.
- Tailwind CSS and shadcn/ui-style components fit the upload/list/detail/report UI.
- Capacitor is reasonable as a later Android packaging path because the first version can ship as a responsive web app.
- Spring Boot is a good backend choice for multipart uploads, scheduled jobs, REST APIs, and AI integration boundaries.
- PostgreSQL + pgvector is enough for the expected meeting volume. The attachment estimates about 2,600 chunks per year, which is small.
- Docker Compose is sufficient for local database setup.

## Scaffold Decision

Created a small full-stack scaffold rather than a broad product implementation:

```text
browser
  |
  | REST / multipart upload
  v
Spring Boot API
  |
  | Flyway migration
  v
PostgreSQL + pgvector
```

## Correction Applied

The attachment recommends declaring `embedding VECTOR(3072)` while inserting OpenAI `text-embedding-3-small` vectors with 1536 dimensions. pgvector enforces the declared dimension, so a 1536-dimensional vector cannot be inserted into a `VECTOR(3072)` column.

The scaffold uses `VECTOR(1536)` for the initial migration because the seeded active embedding model is `text-embedding-3-small`. If the embedding model changes later, choose one of these explicit migration paths:

1. Add model-specific chunk tables, such as `transcript_chunks_3072`.
2. Change the column dimension with a planned re-embedding migration.
3. Use an unbounded `VECTOR` column and model-specific expression indexes if multi-dimension storage becomes necessary.

For the current small-volume system, the first version should stay boring: one active embedding model and one fixed-dimension indexed column.
