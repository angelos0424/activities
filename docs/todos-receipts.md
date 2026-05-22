# TODO: Receipt Service

Related PRD: `docs/prd-receipts.md`

Goal: Manage receipt submission and transfer status through a local Discord bot + Google Sheets.

## Local Bot Setup

- [x] Define local bot runtime.
  - Node.js + TypeScript.
  - `discord.js`.
  - Docker Compose.
  - Source: `docs/tech-stack.md`.

- [ ] Define local receipt storage.
  - `data/receipts/{yyyy}/{MM}/{generated_filename}`.
  - Generated filename only.
  - Max file size.
  - Source: `docs/data-schema.md`.

- [ ] Add slash command for sheet configuration.
  - `/receipt sheet status`
  - `/receipt sheet set people:<url> transfers:<url>`
  - Admin-only permission check.

## Spreadsheet Design

- [x] Define People Sheet columns.
  - person_id
  - type
  - name
  - contact
  - optional account
  - Source: `docs/data-schema.md`.

- [x] Define Transfer Sheet columns.
  - transfer_id
  - person_id
  - name
  - account
  - amount
  - status: 송금전, 완료, 보류
  - receipt_local_path
  - receipt_original_filename
  - receipt_mime_type
  - Source: `docs/data-schema.md`.

## Discord Flow

- [x] Decide command names.
  - Recommended: `/receipt add`, `/receipt check`.
  - Avoid unscoped receipt commands like `/check`.
  - Source: `docs/discord-command-spec.md`.

- [ ] Design person/org search response.
  - Single exact match: show confirmation.
  - Multiple matches: show select menu.
  - No match: open new person/org form.

- [ ] Design receipt image collection.
  - Attachment in command if SDK supports it.
  - Reply attachment fallback if not.
  - Save uploaded image to local storage.

## Product Decisions

- [ ] Decide amount input.
  - Manual input now.
  - OCR later if repeated use proves it matters.

- [ ] Define privacy handling for account information.
  - Who can run `/receipt check`?
  - Who can see 계좌번호?
  - Should Discord messages redact account numbers?

- [ ] Define local file storage error handling.
  - Storage directory missing.
  - Permission denied.
  - Duplicate upload.
  - Invalid file type.

- [x] Define SQLite local state.
  - Sheet URLs.
  - Local file metadata.
  - Command audit log.
  - Source: `docs/data-schema.md`.

## Validation

- [ ] Add a known person/org through the Sheet.
- [ ] Run `/receipt add` and confirm matching behavior.
- [ ] Add a new person/org through Discord.
- [ ] Confirm Transfer Sheet row starts as `송금전`.
- [ ] Upload a receipt image and confirm it is saved locally.
- [ ] Confirm the local path is written to the Transfer Sheet.
- [ ] Change sheet URL with slash command and confirm new commands use it.
- [ ] Change row to `완료` manually in Sheets.
- [ ] Run `/receipt check` and confirm counts update.
