# Activities TODO Roadmap

Source: `docs/prd.md` in PR #6.

## Current MVP Source of Truth

The active MVP is an SNS 업무 자동화 Discord bot operated through slash
commands in configured Discord channels.

The roadmap below separates the current execution queue from the legacy web,
OCR, meeting transcript, and report-screen plan. Legacy items are preserved for
context, but they are deferred and must not be picked up as active work unless a
future issue explicitly moves them back into scope.

## Why the Roadmap Changed

- Discord bot first is the lowest-cost way to validate the workflows users need
  right now.
- A web app, OCR provider, meeting analysis pipeline, and report UI would expand
  the MVP before the Discord workflow is proven.
- Current tasks should prefer command contracts, channel guardrails, local test
  fakes, and simple persistence boundaries over browser screens.

## Current Execution Queue

- [ ] Define the Discord bot command inventory.
  - Include command names, required arguments, optional arguments, success text,
    and failure text for the first MVP commands.
  - Domains considered: SNS, Receipts, Google Sheets, Todo.
  - Validation: command spec is committed as a markdown or code-adjacent
    contract document.

- [ ] Add the minimal Discord bot runtime scaffold.
  - Include application entrypoint, config loading, Discord token loading, and
    allowed channel loading.
  - Keep secrets in environment variables only.
  - Validation: local startup fails clearly when required env vars are missing.

- [ ] Implement configured-channel enforcement.
  - Reject commands from non-allowed channels before domain handlers run.
  - Validation: tests cover allowed channel, rejected channel, and missing
    channel configuration.

- [ ] Implement one no-side-effect smoke command.
  - A command such as `/ping` or `/status` should return bot health and
    configured domain availability.
  - Validation: command handler tests cover success and error formatting.

- [ ] Decide and specify the first production domain command.
  - Choose one first command from SNS, Receipts, Google Sheets, or Todo.
  - Validation: selected command has acceptance criteria before implementation.

## Current Discussion Queue

- [ ] Decide hosting/runtime target.
  - Compare single long-running bot process, containerized service, and
    serverless interaction endpoint.

- [ ] Decide persistent storage boundary.
  - Compare PostgreSQL, Google Sheets, and local/file storage for development.

- [ ] Decide initial command permissions.
  - Clarify whether channel allowlist is enough or user/role allowlists are
    required from day one.

- [ ] Decide Korean/English response policy.
  - Clarify whether bot responses are Korean-only, English-only, or match input.

---

## Superseded and Deferred Legacy Roadmap

Status: deferred. The content below is preserved from the earlier web/OCR/meeting
roadmap and is not part of the current MVP execution queue.

Re-entry rule: move one legacy item into the current queue only when a future
issue names the domain, explains why Discord bot MVP needs it now, and includes
targeted validation.

## Legacy Current Status

- Frontend scaffold exists in `frontend/`.
  - `frontend/src/App.tsx` currently renders static 회계/회의 sections.
  - Upload inputs exist visually, but there is no API client, request state, or real data binding.
  - Meeting list uses hard-coded mock data.
- Backend scaffold exists in `backend/`.
  - `ActivitiesApplication.java` is the only Java application source file.
  - No controllers, services, repositories, DTOs, or AI/OCR provider implementations exist yet.
- Database scaffold exists.
  - `backend/src/main/resources/db/migration/V1__create_meetings_schema.sql` creates the meeting-related schema.
  - Accounting/expense tables are not defined yet.
- Local infrastructure exists.
  - `docker-compose.yml` runs PostgreSQL with pgvector.

---

## Legacy 1. Client Implementation

Goal: Turn the static React/Vite scaffold into a usable MVP client for the PRD flows.

Related PRD items: FE-001 through FE-008, Acceptance Criteria 1-6.

### 1.1 Frontend structure

- [ ] Create a small frontend API layer.
  - Files:
    - `frontend/src/lib/api.ts`
    - `frontend/src/lib/types.ts`
  - Include typed functions for:
    - `uploadReceiptImage(file)`
    - `uploadMeetingTxt(file)`
    - `listMeetings()`
    - `getMeeting(id)`
    - `searchMeetings(query)`
    - `getMeetingReport(id)`
  - Use a single API base URL from `import.meta.env.VITE_API_BASE_URL`, defaulting to `http://localhost:8080`.

- [ ] Split `frontend/src/App.tsx` into focused components.
  - Suggested files:
    - `frontend/src/components/AppShell.tsx`
    - `frontend/src/features/accounting/ReceiptUploadCard.tsx`
    - `frontend/src/features/meetings/MeetingUploadButton.tsx`
    - `frontend/src/features/meetings/MeetingList.tsx`
    - `frontend/src/features/meetings/MeetingDetail.tsx`
    - `frontend/src/features/meetings/MeetingSearch.tsx`
    - `frontend/src/features/meetings/MeetingReport.tsx`

### 1.2 Accounting UI

- [ ] Wire the receipt image input to the backend upload endpoint.
  - Accept image files only.
  - Show selected file name, upload progress/pending state, success state, and error state.
  - Disable duplicate submit while upload is pending.

- [ ] Add a minimal OCR result preview panel.
  - Display merchant/vendor, transaction date, total amount, currency, and processing status if returned by the API.
  - If OCR is async, display the returned job/expense status.

### 1.3 Meeting UI

- [ ] Wire the `.txt` meeting upload input to the backend upload endpoint.
  - Accept `.txt,text/plain` only.
  - Show upload/processing status.
  - Refresh the meeting list after successful upload.

- [ ] Replace hard-coded meeting data with `GET /api/meetings`.
  - Show title, meeting date, status, and summary/analysis status.
  - Include loading, empty, and error states.

- [ ] Add meeting detail rendering.
  - Show raw/cleaned transcript summary, decisions, action item candidates, and metadata.
  - Keep the MVP simple: either inline selected card detail or a lightweight route/state-based detail view.

- [ ] Add meeting search.
  - Query backend search endpoint.
  - Render related meeting, chunk content, speaker name, timestamp range, and decision/action item links when available.

- [ ] Add report view.
  - Render print-friendly meeting report with title, date, summary, decisions, action items, and source metadata.
  - Add a `window.print()` button.

### 1.4 Frontend validation

- [ ] Run `cd frontend && npm install` if dependencies are missing.
- [ ] Run `cd frontend && npm run build`.
- [ ] Manually verify:
  - Receipt image can be selected and submitted.
  - TXT meeting file can be selected and submitted.
  - Meeting list loads from API.
  - Meeting detail and report states render without mock-only assumptions.

---

## Legacy 2. OCR Analysis and Expense Data Server

Goal: Implement the accounting backend path from receipt image upload to OCR-derived expense data and scheduled unpaid notification.

Related PRD items: Goals 1-2, Accounting Flow, BE-001 through BE-005, Open Questions 1-2.

### 2.1 Accounting data model

- [ ] Add a Flyway migration for accounting tables.
  - Suggested file: `backend/src/main/resources/db/migration/V2__create_accounting_schema.sql`
  - Suggested schema/tables:
    - `accounting.receipts`
    - `accounting.expenses`
    - `accounting.ocr_results`
    - `accounting.notification_runs`
  - Minimum expense fields until clarified:
    - `id`
    - `receipt_id`
    - `vendor_name`
    - `transaction_date`
    - `total_amount`
    - `currency`
    - `payment_status` (`pending`, `approved`, `paid`, `rejected`)
    - `memo`
    - `created_at`, `updated_at`

- [ ] Add indexes for unpaid expense lookup.
  - `payment_status`
  - `transaction_date`
  - `created_at`

### 2.2 Upload API

- [ ] Create receipt upload DTOs.
  - Suggested package: `com.activities.accounting.dto`
  - DTOs:
    - `ReceiptUploadResponse`
    - `ExpenseSummaryResponse`
    - `OcrStatusResponse`

- [ ] Create `ReceiptController`.
  - Suggested file: `backend/src/main/java/com/activities/accounting/ReceiptController.java`
  - Endpoint: `POST /api/accounting/receipts`
  - Request: multipart file field `file`
  - Validate:
    - file is present
    - content type starts with `image/`
    - file size is within configured limit
  - Response: receipt/expense id and processing status.

- [ ] Create service boundary.
  - Suggested files:
    - `ReceiptService.java`
    - `OcrProvider.java`
    - `ExpenseParser.java`
    - `ExpenseRepository.java` or JDBC-based DAO
  - Keep provider interface separate so Google Vision can be swapped or mocked.

### 2.3 OCR provider and parsing

- [ ] Implement a local/mock OCR provider first.
  - Return deterministic extracted text for tests/dev when no external credential is configured.
  - This keeps MVP testable without secrets.

- [ ] Add Google Vision-compatible provider boundary.
  - Do not hard-code credentials.
  - Read provider choice and credentials from environment/config.
  - Keep actual external provider optional for MVP.

- [ ] Implement expense field extraction from OCR text.
  - Start with rule-based extraction for amount/date/vendor.
  - Store raw OCR text for traceability.
  - Mark uncertain fields as nullable rather than guessing.

### 2.4 Scheduled unpaid notification

- [ ] Enable scheduling in the Spring Boot application.
  - Add `@EnableScheduling`.

- [ ] Implement unpaid expense query.
  - Find `payment_status = 'pending'` or configured unpaid states.

- [ ] Implement email provider boundary.
  - Suggested interface: `EmailProvider`.
  - MVP providers:
    - log-only provider for local development
    - Resend-compatible provider for production later

- [ ] Implement daily 17:00 notification job.
  - Configurable cron expression.
  - Record each run in `accounting.notification_runs`.

### 2.5 Backend validation

- [ ] Add controller/service tests for image upload validation.
- [ ] Add unit tests for OCR text parsing.
- [ ] Add scheduler/service test for unpaid expense selection.
- [ ] Run `cd backend && mvn test`.
- [ ] Verify DB migration with Docker PostgreSQL + Flyway.

---

## Legacy 3. STT/TXT Meeting Upload and Analysis Server

Goal: Implement the meeting backend path for TXT transcript upload, text processing, embedding, summary, decisions, action items, list/detail/search/report APIs.

Note: PRD currently scopes the MVP to TXT meeting transcript upload. Audio STT conversion is a future extension unless explicitly added later.

Related PRD items: Goals 3-5, Meeting Upload Flow, Meeting Detail and Report Flow, Meeting Search Flow, BE-006 through BE-011, DB-001 through DB-006.

### 3.1 Meeting API contracts

- [ ] Define meeting DTOs.
  - Suggested package: `com.activities.meetings.dto`
  - DTOs:
    - `MeetingUploadResponse`
    - `MeetingListItemResponse`
    - `MeetingDetailResponse`
    - `MeetingSearchResponse`
    - `MeetingReportResponse`
    - `DecisionResponse`
    - `ActionItemResponse`
    - `TranscriptChunkResponse`

- [ ] Create `MeetingController`.
  - Suggested endpoints:
    - `POST /api/meetings/uploads` for TXT multipart upload
    - `GET /api/meetings` for list
    - `GET /api/meetings/{id}` for detail
    - `GET /api/meetings/search?q=` for search
    - `GET /api/meetings/{id}/report` for report

### 3.2 TXT upload and transcript storage

- [ ] Implement TXT upload validation.
  - Accept `.txt` / `text/plain`.
  - Reject empty files.
  - Store original raw text in `meetings.transcripts.raw_text`.

- [ ] Create meeting metadata on upload.
  - Use file name as default title if no title metadata exists.
  - Use current timestamp as default meeting date if not provided.
  - Set processing status explicitly. If the existing `meetings.meetings.status` is insufficient, add a dedicated analysis status column in a new migration.

- [ ] Implement text cleanup.
  - Normalize line endings.
  - Trim repeated blank lines.
  - Preserve speaker/timestamp lines where present.

### 3.3 Chunking and token estimation

- [ ] Implement token estimation utility.
  - MVP can use approximate Korean-friendly character/token heuristic.
  - Store transcript and chunk token counts.

- [ ] Implement chunking service.
  - Target around 500 tokens per chunk with overlap.
  - Preserve `chunk_index`.
  - Parse optional speaker name and timestamp into `speaker_name`, `started_at_seconds`, `ended_at_seconds` when available.

### 3.4 Embedding provider

- [ ] Create `EmbeddingProvider` interface.
  - Methods should expose model name, provider name, dimensions, and embedding generation.

- [ ] Implement deterministic mock embedding provider for tests/local development.
  - Must return exactly 1536 dimensions to match `VECTOR(1536)`.

- [ ] Add OpenAI-compatible provider boundary.
  - Read API key from environment only.
  - Do not require external provider for local tests.

- [ ] Ensure active `embedding_configs` is used.
  - Validate generated embedding dimension equals active config dimension before insert.

### 3.5 AI analysis provider

- [ ] Create `MeetingAnalysisProvider` interface.
  - Inputs: cleaned transcript text and/or chunks.
  - Outputs: summary, decisions, action item candidates.

- [ ] Implement deterministic local/mock analyzer.
  - Useful for tests and development without API keys.

- [ ] Add LLM provider boundary for future external model integration.
  - Keep provider optional/config-driven.

### 3.6 Persistence and API responses

- [ ] Implement repository/DAO layer for meeting tables.
  - Tables already exist in `V1__create_meetings_schema.sql`:
    - `meetings.meetings`
    - `meetings.transcripts`
    - `meetings.transcript_chunks`
    - `meetings.action_items`
    - `meetings.decisions`

- [ ] Implement list endpoint.
  - Return meeting id, title, date, status, short summary/status metadata.

- [ ] Implement detail endpoint.
  - Return metadata, transcript summary, decisions, action items, and optional chunks.

- [ ] Implement report endpoint.
  - Return a print-friendly shape with meeting title/date, summary, decisions, action items, and source notes.

### 3.7 Search

- [ ] Implement keyword search first.
  - Search meeting title, transcript text, chunk content, decision content.

- [ ] Implement vector search when embeddings exist.
  - Generate query embedding using the active provider.
  - Use pgvector cosine distance.
  - Combine or clearly separate keyword and vector results.

- [ ] Return source context.
  - Meeting id/title.
  - Chunk id/content.
  - Speaker name and timestamp range when available.
  - Linked decision/action item when applicable.

### 3.8 Backend validation

- [ ] Add controller tests for TXT upload validation.
- [ ] Add unit tests for cleanup, token estimation, and chunking.
- [ ] Add unit tests for mock embedding dimension enforcement.
- [ ] Add repository/integration test for list/detail/search if Testcontainers or Docker DB is available.
- [ ] Run `cd backend && mvn test`.
- [ ] Verify Flyway migrations against `pgvector/pgvector:pg16`.

---

## Legacy 4. Integration Validation

Goal: Prove the client, server, database, and MVP flows work together.

Related PRD items: Acceptance Criteria 1-8.

### 4.1 Local environment

- [ ] Start PostgreSQL.
  - Command: `docker compose up -d db`
  - Verify healthcheck passes.

- [ ] Start backend.
  - Command: `cd backend && mvn spring-boot:run`
  - Verify `GET /actuator/health` returns healthy status.

- [ ] Start frontend.
  - Command: `cd frontend && npm run dev`
  - Verify the app loads in browser.

### 4.2 End-to-end smoke tests

- [ ] Receipt upload smoke test.
  - Upload an image file from the UI.
  - Verify backend returns receipt/expense id.
  - Verify expense row exists in DB.
  - Verify UI shows processing/result state.

- [ ] Meeting TXT upload smoke test.
  - Upload a sample `.txt` transcript.
  - Verify meeting appears in list.
  - Verify transcript, chunks, summary, decisions, and action items are stored.
  - Verify detail page renders the stored data.

- [ ] Search smoke test.
  - Search for a term from the uploaded transcript.
  - Verify at least one relevant meeting/chunk result appears.

- [ ] Report smoke test.
  - Open the meeting report view.
  - Verify print layout includes title, date, summary, decisions, and action items.

### 4.3 Build and quality gates

- [ ] Run frontend build.
  - Command: `cd frontend && npm run build`

- [ ] Run backend tests.
  - Command: `cd backend && mvn test`

- [ ] Run repository hygiene check.
  - Command: `git diff --check`

- [ ] Update README with final run instructions once endpoints and flows are implemented.

---

## Legacy 5. Follow-up Clarifications Before Full Implementation

These do not block scaffold-level work, but should be answered before productionizing the flows.

- [ ] Confirm minimum accounting fields for OCR-derived expense data.
- [ ] Confirm whether unpaid notification recipient is fixed by config or editable in UI.
- [ ] Confirm expected TXT transcript format, especially CLOVA Note speaker/timestamp conventions.
- [ ] Confirm whether browser print is enough for reports or server-generated PDF is required.
- [ ] Confirm whether action items should stay local or sync to a kanban/external task system.
- [ ] Decide when authentication becomes required before any public deployment.
