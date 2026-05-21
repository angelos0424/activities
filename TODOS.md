# Activities TODO Roadmap

Source of truth for the current MVP: Discord bot workflows operated through
slash commands in configured Discord channels.

This roadmap replaces the previous OCR, meeting transcript, and web frontend
roadmap. The old web-first work is tracked under "Superseded and Deferred
Legacy Scope" at the bottom of this file.

## Execution Rules

- Keep every item small enough for one Symphony task.
- Prefer Discord command flow first, then storage/integration details.
- Do not start web UI, Android, or browser upload work unless this roadmap moves
  it out of deferred scope.
- Each implementation task should include targeted validation in the same PR.

## Immediate First Steps

These are the first executable tasks that unblock the rest of the roadmap.

- [ ] Define the Discord bot command inventory.
  - Output: command names, required arguments, optional arguments, success text,
    and failure text for the first MVP commands.
  - Domains covered: Discord Bot Core, SNS, Receipts, Google Sheets, Todo.
  - Validation: command spec is committed as a markdown or code-adjacent
    contract document.

- [ ] Add the minimal Discord bot runtime scaffold.
  - Output: application entrypoint, config loading, Discord token loading, and
    channel allowlist loading.
  - Keep secrets in environment variables only.
  - Validation: local startup fails clearly when required env vars are missing.

- [ ] Implement configured-channel enforcement.
  - Output: commands from non-allowed channels are rejected before domain
    handlers run.
  - Validation: unit tests cover allowed channel, rejected channel, and missing
    channel configuration.

- [ ] Implement one no-side-effect smoke command.
  - Output: a command such as `/ping` or `/status` returns bot health and
    configured domain availability.
  - Validation: command handler test covers success and error formatting.

- [ ] Decide the first production domain command.
  - Output: one selected command from SNS, Receipts, Google Sheets, or Todo.
  - Validation: selected command has a short acceptance checklist before coding.

## Discussion Queue

Resolve these before building production behavior that depends on the answer.

- [ ] Decide hosting/runtime target.
  - Options to compare: single long-running bot process, containerized service,
    or serverless interaction endpoint if Discord interaction handling requires
    it.

- [ ] Decide persistent storage boundary.
  - Options to compare: PostgreSQL in the existing backend scaffold, Google
    Sheets as the first source of truth, or file/local storage for development
    only.

- [ ] Decide initial command permissions.
  - Clarify whether channel allowlist is enough for MVP or whether user/role
    allowlists are required from day one.

- [ ] Decide Korean/English response policy.
  - Clarify whether bot responses should be Korean-only, English-only, or match
    command input language.

- [ ] Decide audit logging requirements.
  - Clarify what command inputs, outputs, and errors must be retained for
    operations and debugging.

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

### Executable Tasks

- [ ] Define the first todo command contract.
  - Candidate: `/todo-add title:<text> due:<date?> assignee:<user?>`.
  - Output should include created task summary and next action.

- [ ] Validate todo command input.
  - Cover required title, maximum title length, optional due date parsing, and
    optional assignee parsing.

- [ ] Define todo record shape.
  - Include id, title, description, status, requester, assignee, source Discord
    message ID, due date, created time, and updated time.

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

These items came from the earlier OCR, meeting transcript, and web frontend
roadmap. They are not active MVP work unless a future issue explicitly moves
them back into the domain roadmap above.

### Superseded by Discord Bot MVP

- [ ] React/Vite client as the primary user interface.
  - Reason: the current MVP is operated through Discord slash commands.

- [ ] Browser-based receipt image upload screen.
  - Reason: receipt intake should start from Discord command/attachment flow.

- [ ] Browser-based meeting TXT upload screen.
  - Reason: meeting upload is not part of the active domain list for this MVP.

- [ ] Meeting list, detail, search, and report frontend pages.
  - Reason: web meeting review is outside the Discord bot MVP.

- [ ] Android or mobile packaging path.
  - Reason: the active client surface is Discord, not a mobile app shell.

### Deferred Until a Domain Reintroduces Them

- [ ] OCR provider implementation for receipt extraction.
  - Re-entry condition: Receipts domain decides OCR is required for MVP or a
    later milestone.

- [ ] Receipt expense database schema from the old accounting backend plan.
  - Re-entry condition: Receipts domain chooses PostgreSQL as the system of
    record instead of or alongside Google Sheets.

- [ ] Scheduled unpaid receipt email notifications.
  - Re-entry condition: Receipts domain defines payment states, recipients, and
    notification policy.

- [ ] Meeting transcript ingestion, chunking, embeddings, search, and reports.
  - Re-entry condition: Meeting automation becomes an explicit domain again.

- [ ] AI meeting summary, decision, and action-item extraction.
  - Re-entry condition: Meeting automation or Todo domain explicitly needs
    transcript-derived tasks.

- [ ] OpenAI, Google Vision, or other external AI provider integration.
  - Re-entry condition: a domain command has a committed provider contract,
    credential policy, and eval/test plan.

- [ ] Full web frontend integration validation.
  - Re-entry condition: web UI becomes an active product surface again.

## Validation Checklist for Roadmap Changes

- [ ] `git diff --check`
- [ ] Confirm this file still separates executable tasks from discussion items.
- [ ] Confirm new work is placed under exactly one active domain unless it is
  shared Deploy/Ops work.
- [ ] Confirm deferred legacy work remains out of the active MVP path.
