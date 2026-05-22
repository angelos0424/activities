# Roadmap

This roadmap tracks the overall build order for Activities. Detailed requirements remain in the service PRDs and TODO files.

## Current Direction

The MVP is a Docker Compose-managed local Discord bot for one Discord server.

Services:

1. SNS upload in `#sns`.
2. Receipt and transfer tracking in `#receipt`.
3. Todo and schedule management in `#todo`.

## Phase 0: Product and Implementation Spec

Goal: make the scope implementable without reinterpreting old meeting/accounting requirements.

- [x] Reset PRD into service-specific documents.
- [x] Keep root `docs/prd.md` as PRD index.
- [x] Keep root `TODOS.md` as TODO index.
- [x] Decide Discord as the shared operation surface.
- [x] Decide local bot MVP stack.
- [x] Decide receipt local file path: `data/receipts/{yyyy}/{MM}/{generated_filename}`.
- [x] Add Discord command spec.
- [x] Add shared data schema.
- [ ] Confirm exact Google Sheets column headers with the real sheets.
- [ ] Confirm Discord channel ids and admin role id.

## Phase 1: Shared Local Bot Foundation

Goal: one working bot process that can receive commands in the correct channels.

- [ ] Add Node.js + TypeScript bot package.
- [ ] Add `discord.js` command registration.
- [ ] Add Docker Compose service for the bot.
- [ ] Add `.env.example` for bot credentials and local paths.
- [ ] Add SQLite initialization.
- [ ] Add command audit logging.
- [ ] Add shared retry helper for 2 to 3 retries and final user-facing failure.
- [ ] Add channel validation for `#sns`, `#receipt`, and `#todo`.

## Phase 2: Receipt MVP

Goal: reduce the highest-risk repetitive admin work first.

- [ ] Implement `/receipt sheet status`.
- [ ] Implement `/receipt sheet set`.
- [ ] Implement People Sheet search.
- [ ] Implement new person/org creation.
- [ ] Implement Transfers Sheet row creation with status `송금전`.
- [ ] Implement local receipt image save.
- [ ] Write `receipt_local_path` back to Transfers Sheet.
- [ ] Implement `/receipt check`.
- [ ] Test upload, bot restart, and Google Sheets failure cases.

## Phase 3: SNS MVP

Goal: make cross-channel posting trackable even if some targets stay manual.

- [ ] Implement `/post` command input flow.
- [ ] Implement asset collection from Discord messages or modal file upload.
- [ ] Store SNS post request and targets.
- [ ] Implement homepage upload or manual upload packet.
- [ ] Implement Instagram/Facebook feasibility path.
- [ ] Return per-target result URL or manual action.
- [ ] Implement retry for failed targets only.

## Phase 4: Todo Prototype

Goal: validate whether Discord-based todo is simpler than the current calendar workflow.

- [ ] Run Todo discovery with the actual users.
- [ ] Decide Todo storage mode: SQLite or Google Sheets.
- [ ] Implement `/todo add`.
- [ ] Implement `/todo list`.
- [ ] Implement `/todo status`.
- [ ] Add Naver map search/deep link button for location items.
- [ ] Review whether a web/mobile companion UI is necessary.

## Phase 5: Hardening

Goal: make the local setup reliable enough for weekly use.

- [ ] Add startup health checks.
- [ ] Add clear setup guide for Discord bot token and Google service account.
- [ ] Add permission checks for admin-only commands.
- [ ] Add command-level error logging.
- [ ] Add basic smoke tests for command handlers.
- [ ] Add operational notes for local data location.

## Deferred

- Hosted deployment.
- PostgreSQL migration for product data.
- S3 or cloud file storage.
- KakaoTalk automation.
- Full web/mobile dashboard.
- AI OCR and automatic accounting classification.
