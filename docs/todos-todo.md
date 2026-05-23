# Activities Roadmap

Source of truth for the current MVP: Discord bot workflows operated through
slash commands in configured Discord channels.

## Document Paths and Source of Truth

- Current execution 기준 문서: `docs/todos-todo.md` (Activities roadmap source of
  truth).
- Legacy 보존 문서: the `Superseded and Deferred Legacy Scope` section in this
  file. It preserves old web/OCR/meeting tasks only and is not an active queue.
- Compatibility path: root `TODOS.md` is retained as a pointer to this file so
  old repository references keep working without creating a second TODO source
  of truth.
- Decision: keep one Activities roadmap source at `docs/todos-todo.md` and only
  a compatibility pointer at `TODOS.md`. The `-todo` filename is a
  compatibility/source-of-truth path from issue #110; the roadmap content covers
  all active Discord bot MVP domains.

## Current MVP Source of Truth

The active MVP is an Activities 업무 자동화 Discord bot operated through slash
commands in configured Discord channels.

The roadmap below separates the current execution queue and active domain
roadmaps from the legacy web, OCR, meeting transcript, and report-screen plan.
Legacy items are preserved for context, but they are deferred and must not be
picked up as active work unless a future issue explicitly moves them back into
scope.

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

## Active Domain Roadmaps

Status: active detailed planning for the Discord bot MVP. These domain roadmaps
expand the current execution and discussion queues above; they are not legacy or
deferred work.

---

## Domain Roadmap: Discord Bot Core

Goal: provide the command runtime, guardrails, handler routing, and shared
response conventions used by every domain.

### Executable Tasks

- [ ] Create Discord configuration contract.
  - Include bot token env var, allowed channel IDs, guild IDs if needed, command
    registration mode, and local development defaults.

- [ ] Create command registration workflow.
  - Register slash commands from a single command definition list.
  - Add a dry-run mode that prints the commands without registering them.

- [ ] Create command handler router.
  - Route each command to a domain handler by command name.
  - Return a consistent unknown-command response.

- [ ] Create shared response formatter.
  - Standardize success, validation failure, permission failure, and internal
    error messages.
  - Keep user-facing failures actionable.

- [ ] Add structured command logging.
  - Log command name, channel ID, requester ID, result status, and duration.
  - Do not log secrets or sensitive attachment contents.

- [ ] Add core tests.
  - Cover config loading, channel enforcement, routing, response formatting, and
    error handling.

### Discussion Needed

- [ ] Should command registration run automatically on startup or as an explicit
  deploy/admin command?
- [ ] Should MVP responses be ephemeral when possible, public in-channel, or
  domain-specific?
- [ ] What is the minimum acceptable observability for the first deploy?

---

## Domain Roadmap: SNS

Goal: let users request SNS-related automation from Discord without leaving the
configured channel.

### Executable Tasks

- [ ] Define the first SNS command contract.
  - Candidate: `/sns-draft topic:<text> channel:<target>`.
  - Output should be a draft, validation errors, and next action.

- [ ] Implement SNS input validation.
  - Validate required topic/content fields, maximum length, and supported target
    channel values.

- [ ] Implement deterministic local SNS handler.
  - Return a predictable draft/result for development and tests.
  - Do not call external SNS APIs yet.

- [ ] Add SNS handler tests.
  - Cover valid draft request, missing topic, unsupported target, and long input.

- [ ] Add SNS result formatting.
  - Return a Discord message that separates generated text, warnings, and next
    action.

### Discussion Needed

- [ ] Which SNS platform is first: Instagram, X/Twitter, Threads, LinkedIn, or
  another target?
- [ ] Is the MVP only draft generation, or should it publish to an SNS account?
- [ ] Who approves SNS content before publishing?
- [ ] Are brand voice, banned terms, hashtags, or media attachment rules needed?

---

## Domain Roadmap: Receipts

Goal: support receipt-related automation through Discord commands and
attachments, without reviving the old web upload flow.

### Executable Tasks

- [ ] Define the first receipt command contract.
  - Candidate: `/receipt-add` with a Discord attachment and optional memo.
  - Output should include accepted/rejected status and next action.

- [ ] Validate Discord receipt attachments.
  - Accept supported image/PDF MIME types.
  - Reject missing, oversized, or unsupported attachments with clear messages.

- [ ] Create receipt record shape.
  - Define fields for submitter, Discord message ID, attachment metadata, memo,
    amount, vendor, date, status, and created time.

- [ ] Implement receipt intake without OCR.
  - Store metadata and mark extraction status as `pending_manual_review` or
    equivalent.
  - Keep the task useful before any OCR provider exists.

- [ ] Add receipt intake tests.
  - Cover accepted attachment, missing attachment, unsupported MIME type, and
    oversized attachment.

### Discussion Needed

- [ ] Is receipt storage Google Sheets, PostgreSQL, or both?
- [ ] Is OCR required for MVP, or can MVP start with manual amount/date fields?
- [ ] Which receipt file types and size limits are acceptable?
- [ ] Who can submit receipts, and who can mark them reviewed or paid?

---

## Domain Roadmap: Google Sheets

Goal: use Google Sheets where it is the fastest useful system of record or
reporting surface for bot workflows.

### Executable Tasks

- [ ] Define Google Sheets integration contract.
  - Include spreadsheet ID, worksheet names, required columns, and credential env
    vars.

- [ ] Create a Sheets client boundary.
  - Keep the interface small: append row, update row, find rows by key, and
    health check.

- [ ] Implement a fake Sheets client for tests.
  - Use in-memory rows so domain handlers can be tested without Google
    credentials.

- [ ] Implement first append-only workflow.
  - Candidate: append accepted receipt metadata or todo item from a Discord
    command.

- [ ] Add Sheets integration tests around the client boundary.
  - Cover append success, missing config, API failure, and duplicate external key
    handling.

### Discussion Needed

- [ ] Which sheet is the first source of truth: receipts, todo, SNS content
  calendar, or operations log?
- [ ] Should the bot create worksheets or require pre-created sheet templates?
- [ ] What duplicate key should prevent repeated writes after Discord retries?
- [ ] What Google account or service account owns the spreadsheet?

---

## Domain Roadmap: Todo

Goal: let users capture and manage lightweight tasks from Discord, with a clear
path to storage and reporting.

Contract source: `docs/prd-todo.md`의 `Todo Domain PRD` section defines the
MVP user flows, command candidates, validation rules, record shape, acceptance
criteria, non-goals, and open questions. Implementation work should treat that
section as the first Todo command contract.

### Executable Tasks

- [ ] Define the first todo command contract.
  - Use the PRD candidates: `/todo-add`, `/todo-list`, and `/todo-done`.
  - Output should include task summary, validation failure text, empty-list
    text, and next action for each command.

- [ ] Validate todo command input.
  - Cover required title, maximum title length, optional due date parsing, and
    optional Discord user mention parsing as specified in the PRD.

- [ ] Define todo record shape.
  - Include id, title, status, requester, assignee, source Discord message ID,
    due date, created time, updated time, and completed time.

- [ ] Implement local todo handler with fake storage.
  - Support add and list behavior in memory for tests before choosing permanent
    storage.

- [ ] Add todo handler tests.
  - Cover add success, invalid due date, missing title, list empty, and list with
    existing items.

### Discussion Needed

- [ ] Is Todo independent, or should it sync to an external task system later?
- [ ] What statuses are required for MVP: open/done only, or more workflow
  states?
- [ ] Should Discord users map directly to assignees?
- [ ] Should todos live in Google Sheets, PostgreSQL, or both?

---

## Domain Roadmap: Deploy/Ops

Goal: make the bot deployable, observable, and recoverable without depending on
a developer's local machine.

### Executable Tasks

- [ ] Document required environment variables.
  - Include Discord token, channel allowlist, command registration settings,
    storage settings, and Google credentials when used.

- [ ] Add local run command documentation.
  - Include how to start the bot, run tests, and register commands in a dev
    Discord server.

- [ ] Add CI validation for the bot code path.
  - Run formatting, unit tests, and build/package checks for the bot service.

- [ ] Add deployment checklist.
  - Include secret setup, command registration, health check, smoke command, and
    rollback steps.

- [ ] Add operational health command.
  - Reuse the no-side-effect smoke command to show runtime version, configured
    domains, and dependency health.

### Discussion Needed

- [ ] What is the first deployment target?
- [ ] Who owns Discord application credentials and production secrets?
- [ ] What uptime expectation is acceptable for MVP?
- [ ] What alert channel should receive bot startup, crash, and command failure
  notifications?

---

## Superseded and Deferred Legacy Scope

Status: deferred. The content below is preserved from the earlier web/OCR/meeting
roadmap and is not part of the current MVP execution queue or active domain
roadmaps.

Re-entry rule: move one legacy item into the current queue only when a future
issue names the domain, explains why Discord bot MVP needs it now, and includes
targeted validation.

These items came from the earlier OCR, meeting transcript, and web frontend
roadmap. They are preserved here so the old roadmap is not lost, but they are
not active MVP work unless a future issue explicitly moves them back into the
domain roadmap above.

### Legacy Boundary Notes

- The former `Immediate First Steps` queue repeated the same command inventory,
  runtime scaffold, channel enforcement, smoke command, and first-domain-command
  tasks that now live in `Current Execution Queue`.
- Those repeated items were removed from the legacy section. They should be
  tracked only once, in the active queue above.
- Legacy content starts in this section and keeps explicit re-entry conditions
  for deferred work.

### Superseded by Discord Bot MVP

These legacy client tasks are superseded because the current MVP user surface is
Discord slash commands, not a browser or mobile app.

- [ ] Create a small frontend API layer.
  - Legacy files:
    - `frontend/src/lib/api.ts`
    - `frontend/src/lib/types.ts`
  - Legacy functions:
    - `uploadReceiptImage(file)`
    - `uploadMeetingTxt(file)`
    - `listMeetings()`
    - `getMeeting(id)`
    - `searchMeetings(query)`
    - `getMeetingReport(id)`
  - Re-entry condition: web UI becomes an active product surface again.

- [ ] Split `frontend/src/App.tsx` into focused components.
  - Legacy suggested files:
    - `frontend/src/components/AppShell.tsx`
    - `frontend/src/features/accounting/ReceiptUploadCard.tsx`
    - `frontend/src/features/meetings/MeetingUploadButton.tsx`
    - `frontend/src/features/meetings/MeetingList.tsx`
    - `frontend/src/features/meetings/MeetingDetail.tsx`
    - `frontend/src/features/meetings/MeetingSearch.tsx`
    - `frontend/src/features/meetings/MeetingReport.tsx`
  - Re-entry condition: web UI becomes an active product surface again.

- [ ] Wire the receipt image input to the backend upload endpoint.
  - Accept image files only.
  - Show selected file name, upload progress/pending state, success state, and
    error state.
  - Disable duplicate submit while upload is pending.
  - Re-entry condition: receipt intake moves back to browser upload instead of
    Discord attachment flow.

- [ ] Add a minimal OCR result preview panel.
  - Display merchant/vendor, transaction date, total amount, currency, and
    processing status if returned by the API.
  - If OCR is async, display the returned job/expense status.
  - Re-entry condition: web UI becomes an active product surface and Receipts
    domain chooses OCR-backed extraction.

- [ ] Wire the `.txt` meeting upload input to the backend upload endpoint.
  - Accept `.txt,text/plain` only.
  - Show upload/processing status.
  - Refresh the meeting list after successful upload.
  - Re-entry condition: Meeting automation becomes an explicit active domain.

- [ ] Replace hard-coded meeting data with `GET /api/meetings`.
  - Show title, meeting date, status, and summary/analysis status.
  - Include loading, empty, and error states.
  - Re-entry condition: Meeting automation becomes an explicit active domain
    with a web UI.

- [ ] Add meeting detail rendering.
  - Show raw/cleaned transcript summary, decisions, action item candidates, and
    metadata.
  - Keep the MVP simple: either inline selected card detail or a lightweight
    route/state-based detail view.
  - Re-entry condition: Meeting automation becomes an explicit active domain
    with a web UI.

- [ ] Add meeting search.
  - Query backend search endpoint.
  - Render related meeting, chunk content, speaker name, timestamp range, and
    decision/action item links when available.
  - Re-entry condition: Meeting automation becomes an explicit active domain
    with search requirements.

- [ ] Add report view.
  - Render print-friendly meeting report with title, date, summary, decisions,
    action items, and source metadata.
  - Add a `window.print()` button.
  - Re-entry condition: Meeting automation becomes an explicit active domain
    with report requirements.

- [ ] Run legacy frontend validation.
  - Run `cd frontend && npm install` if dependencies are missing.
  - Run `cd frontend && npm run build`.
  - Manually verify:
    - Receipt image can be selected and submitted.
    - TXT meeting file can be selected and submitted.
    - Meeting list loads from API.
    - Meeting detail and report states render without mock-only assumptions.
  - Re-entry condition: web UI becomes an active product surface again.

### Deferred: OCR Analysis and Expense Data Server

---

## Legacy 2. OCR Analysis and Expense Data Server

Goal: Implement the accounting backend path from receipt image upload to OCR-derived expense data and scheduled unpaid notification.

Related PRD items: Goals 1-2, Accounting Flow, BE-001 through BE-005, Open Questions 1-2.

### 2.1 Accounting data model
These legacy accounting backend tasks are deferred until the Receipts domain
chooses OCR, PostgreSQL accounting tables, or scheduled payment notification as
active MVP behavior.


- [ ] Add a Flyway migration for accounting tables.
  - Legacy suggested file:
    - `backend/src/main/resources/db/migration/V2__create_accounting_schema.sql`
  - Legacy suggested schema/tables:
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

- [ ] Create receipt upload DTOs.
  - Legacy suggested package: `com.activities.accounting.dto`
  - Legacy DTOs:
    - `ReceiptUploadResponse`
    - `ExpenseSummaryResponse`
    - `OcrStatusResponse`

- [ ] Create `ReceiptController`.
  - Legacy suggested file:
    - `backend/src/main/java/com/activities/accounting/ReceiptController.java`
  - Legacy endpoint: `POST /api/accounting/receipts`
  - Request: multipart file field `file`
  - Validate:
    - file is present
    - content type starts with `image/`
    - file size is within configured limit
  - Response: receipt/expense id and processing status.

- [ ] Create receipt service boundary.
  - Legacy suggested files:
    - `ReceiptService.java`
    - `OcrProvider.java`
    - `ExpenseParser.java`
    - `ExpenseRepository.java` or JDBC-based DAO
  - Keep provider interface separate so Google Vision can be swapped or mocked.

- [ ] Implement a local/mock OCR provider first.
  - Return deterministic extracted text for tests/dev when no external
    credential is configured.
  - This keeps MVP testable without secrets.

- [ ] Add Google Vision-compatible provider boundary.
  - Do not hard-code credentials.
  - Read provider choice and credentials from environment/config.
  - Keep actual external provider optional for MVP.

- [ ] Implement expense field extraction from OCR text.
  - Start with rule-based extraction for amount/date/vendor.
  - Store raw OCR text for traceability.
  - Mark uncertain fields as nullable rather than guessing.

- [ ] Enable scheduling in the Spring Boot application.
  - Add `@EnableScheduling`.

- [ ] Implement unpaid expense query.
  - Find `payment_status = 'pending'` or configured unpaid states.

- [ ] Implement email provider boundary.
  - Legacy suggested interface: `EmailProvider`.
  - MVP providers:
    - log-only provider for local development
    - Resend-compatible provider for production later

- [ ] Implement daily 17:00 notification job.
  - Configurable cron expression.
  - Record each run in `accounting.notification_runs`.

- [ ] Run legacy accounting backend validation.
  - Add controller/service tests for image upload validation.
  - Add unit tests for OCR text parsing.
  - Add scheduler/service test for unpaid expense selection.
  - Run `cd backend && mvn test`.
  - Verify DB migration with Docker PostgreSQL + Flyway.

### Deferred: STT/TXT Meeting Upload and Analysis Server

---

## Legacy 3. STT/TXT Meeting Upload and Analysis Server

Goal: Implement the meeting backend path for TXT transcript upload, text processing, embedding, summary, decisions, action items, list/detail/search/report APIs.

Note: PRD currently scopes the MVP to TXT meeting transcript upload. Audio STT conversion is a future extension unless explicitly added later.

Related PRD items: Goals 3-5, Meeting Upload Flow, Meeting Detail and Report Flow, Meeting Search Flow, BE-006 through BE-011, DB-001 through DB-006.

### 3.1 Meeting API contracts
These legacy meeting backend tasks are deferred until meeting transcript
automation becomes an explicit active domain again.


- [ ] Define meeting DTOs.
  - Legacy suggested package: `com.activities.meetings.dto`
  - Legacy DTOs:
    - `MeetingUploadResponse`
    - `MeetingListItemResponse`
    - `MeetingDetailResponse`
    - `MeetingSearchResponse`
    - `MeetingReportResponse`
    - `DecisionResponse`
    - `ActionItemResponse`
    - `TranscriptChunkResponse`

- [ ] Create `MeetingController`.
  - Legacy suggested endpoints:
    - `POST /api/meetings/uploads` for TXT multipart upload
    - `GET /api/meetings` for list
    - `GET /api/meetings/{id}` for detail
    - `GET /api/meetings/search?q=` for search
    - `GET /api/meetings/{id}/report` for report

- [ ] Implement TXT upload validation.
  - Accept `.txt` / `text/plain`.
  - Reject empty files.
  - Store original raw text in `meetings.transcripts.raw_text`.

- [ ] Create meeting metadata on upload.
  - Use file name as default title if no title metadata exists.
  - Use current timestamp as default meeting date if not provided.
  - Set processing status explicitly. If the existing `meetings.meetings.status`
    is insufficient, add a dedicated analysis status column in a new migration.

- [ ] Implement text cleanup.
  - Normalize line endings.
  - Trim repeated blank lines.
  - Preserve speaker/timestamp lines where present.

- [ ] Implement token estimation utility.
  - MVP can use approximate Korean-friendly character/token heuristic.
  - Store transcript and chunk token counts.

- [ ] Implement chunking service.
  - Target around 500 tokens per chunk with overlap.
  - Preserve `chunk_index`.
  - Parse optional speaker name and timestamp into `speaker_name`,
    `started_at_seconds`, `ended_at_seconds` when available.

- [ ] Create `EmbeddingProvider` interface.
  - Methods should expose model name, provider name, dimensions, and embedding
    generation.

- [ ] Implement deterministic mock embedding provider for tests/local
  development.
  - Must return exactly 1536 dimensions to match `VECTOR(1536)`.

- [ ] Add OpenAI-compatible provider boundary.
  - Read API key from environment only.
  - Do not require external provider for local tests.

- [ ] Ensure active `embedding_configs` is used.
  - Validate generated embedding dimension equals active config dimension before
    insert.

- [ ] Create `MeetingAnalysisProvider` interface.
  - Inputs: cleaned transcript text and/or chunks.
  - Outputs: summary, decisions, action item candidates.

- [ ] Implement deterministic local/mock analyzer.
  - Useful for tests and development without API keys.

- [ ] Add LLM provider boundary for future external model integration.
  - Keep provider optional/config-driven.

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
  - Return metadata, transcript summary, decisions, action items, and optional
    chunks.

- [ ] Implement report endpoint.
  - Return a print-friendly shape with meeting title/date, summary, decisions,
    action items, and source notes.

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

- [ ] Run legacy meeting backend validation.
  - Add controller tests for TXT upload validation.
  - Add unit tests for cleanup, token estimation, and chunking.
  - Add unit tests for mock embedding dimension enforcement.
  - Add repository/integration test for list/detail/search if Testcontainers or
    Docker DB is available.
  - Run `cd backend && mvn test`.
  - Verify Flyway migrations against `pgvector/pgvector:pg16`.

### Deferred: Legacy Integration Validation

---

## Legacy 4. Integration Validation

Goal: Prove the client, server, database, and MVP flows work together.

Related PRD items: Acceptance Criteria 1-8.

### 4.1 Local environment
These legacy end-to-end checks are deferred because they validate the old
browser-plus-Spring flow, not the active Discord command flow.


- [ ] Start PostgreSQL.
  - Command: `docker compose up -d db`
  - Verify healthcheck passes.

- [ ] Start backend.
  - Command: `cd backend && mvn spring-boot:run`
  - Verify `GET /actuator/health` returns healthy status.

- [ ] Start frontend.
  - Command: `cd frontend && npm run dev`
  - Verify the app loads in browser.

- [ ] Run receipt upload smoke test.
  - Upload an image file from the UI.
  - Verify backend returns receipt/expense id.
  - Verify expense row exists in DB.
  - Verify UI shows processing/result state.

- [ ] Run meeting TXT upload smoke test.
  - Upload a sample `.txt` transcript.
  - Verify meeting appears in list.
  - Verify transcript, chunks, summary, decisions, and action items are stored.
  - Verify detail page renders the stored data.

- [ ] Run search smoke test.
  - Search for a term from the uploaded transcript.
  - Verify at least one relevant meeting/chunk result appears.

- [ ] Run report smoke test.
  - Open the meeting report view.
  - Verify print layout includes title, date, summary, decisions, and action
    items.

- [ ] Run legacy build and quality gates.
  - Run frontend build: `cd frontend && npm run build`
  - Run backend tests: `cd backend && mvn test`
  - Run repository hygiene check: `git diff --check`
  - Update README with final run instructions once endpoints and flows are
    implemented.

### Deferred: Legacy Clarifications Before Full Implementation

- [ ] Run backend tests.
  - Command: `cd backend && mvn test`

- [ ] Run repository hygiene check.
  - Command: `git diff --check`

- [ ] Update README with final run instructions once endpoints and flows are implemented.

---

## Legacy 5. Follow-up Clarifications Before Full Implementation

These do not block scaffold-level work, but should be answered before productionizing the flows.
These questions do not block Discord bot scaffold work. They should be answered
only if the matching deferred legacy scope is reactivated.


- [ ] Confirm minimum accounting fields for OCR-derived expense data.
- [ ] Confirm whether unpaid notification recipient is fixed by config or
  editable in UI.
- [ ] Confirm expected TXT transcript format, especially CLOVA Note
  speaker/timestamp conventions.
- [ ] Confirm whether browser print is enough for reports or server-generated
  PDF is required.
- [ ] Confirm whether action items should stay local or sync to a
  kanban/external task system.
- [ ] Decide when authentication becomes required before any public deployment.

## Validation Checklist for Roadmap Changes

- [ ] `git diff --check`
- [ ] Confirm this file still separates executable tasks from discussion items.
- [ ] Confirm new work is placed under exactly one active domain unless it is
  shared Deploy/Ops work.
- [ ] Confirm deferred legacy work remains out of the active MVP path.
