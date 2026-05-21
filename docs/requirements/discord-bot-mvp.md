# Discord Bot MVP Requirements

## Purpose

Define the minimum Discord bot MVP requirements for the SNS service. The MVP
lets users run operational workflows from configured Discord channels through
slash commands, modal forms, and file attachments.

This document separates items already accepted for implementation from items
that still need product or technical decisions before coding.

## MVP Scope

### Confirmed Implementation Items

| Area | Requirement | Priority |
| --- | --- | --- |
| Discord access | Bot commands run only in configured Discord guilds/channels. | P0 |
| Command surface | MVP uses Discord slash commands as the primary entry point. | P0 |
| Forms | Structured multi-field inputs use Discord modals where slash command options are insufficient. | P0 |
| Attachments | File-based workflows accept Discord attachments and validate file type, size, and presence before domain handling. | P0 |
| Responses | Every command returns a clear start, success, validation failure, or internal error response. | P0 |
| Auditability | Store or log command name, requester, channel, attachment metadata, result status, and timestamp. | P1 |
| Idempotency | Repeated Discord interaction delivery must not duplicate the same external side effect. | P1 |

### Not In MVP

| Item | Rationale |
| --- | --- |
| Web UI | The MVP is validated inside Discord first. |
| Mobile app packaging | Discord is the first client surface. |
| Multi-tenant admin console | Configured guild/channel IDs are enough for MVP validation. |
| Full approval workflow | Intake and status tracking come first; approval state machines can follow once the data shape is proven. |
| Direct publishing without confirmation | SNS publishing needs an approval decision before live account writes are safe. |

## High-Level Flow

```text
Discord user
  |
  | slash command / modal / attachment
  v
Discord bot runtime
  |
  | channel allowlist, input validation, attachment checks
  v
Domain handler
  |
  | SNS upload | receipt/remittance | todo/schedule
  v
Storage or integration boundary
  |
  | persisted record, draft, status, or external write
  v
Discord response
```

## Domain Requirements

### SNS Upload

#### Confirmed Implementation Items

| ID | Requirement | Priority |
| --- | --- | --- |
| SNS-001 | Provide an SNS content intake command such as `/sns-upload` or `/sns-draft`. | P0 |
| SNS-002 | Accept required text fields for title/topic/body and target platform or channel. | P0 |
| SNS-003 | Support optional image or media attachment metadata when Discord provides it. | P1 |
| SNS-004 | Validate required content, max length, target platform, and attachment presence/type before processing. | P0 |
| SNS-005 | Return a Discord preview containing the requested text, selected target, warnings, and next action. | P0 |
| SNS-006 | Default MVP behavior is draft/intake, not live publishing. | P0 |
| SNS-007 | Record requester, source Discord message/interaction ID, target platform, draft content, attachment metadata, and status. | P1 |

#### Discussion Needed

| Topic | Decision Needed |
| --- | --- |
| First target platform | Decide whether the first SNS target is Instagram, X/Twitter, Threads, LinkedIn, or another platform. |
| Publish behavior | Decide whether MVP stops at draft creation or includes approved live publishing. |
| Approval owner | Decide who can approve a draft for publishing if live publishing enters scope. |
| Brand rules | Decide whether tone, banned terms, hashtag rules, and media requirements are required in MVP. |
| Storage | Decide whether SNS drafts live in PostgreSQL, Google Sheets, or another system of record. |

### Receipt and Remittance History

#### Confirmed Implementation Items

| ID | Requirement | Priority |
| --- | --- | --- |
| PAY-001 | Provide a receipt intake command such as `/receipt-add`. | P0 |
| PAY-002 | Require at least one receipt attachment for receipt intake. | P0 |
| PAY-003 | Accept optional memo and payment/remittance reference fields through slash options or a modal. | P0 |
| PAY-004 | Validate supported file types, file size, attachment count, and missing attachment cases before storing metadata. | P0 |
| PAY-005 | Store receipt metadata: requester, Discord message/interaction ID, attachment name, content type, size, memo, status, and created time. | P0 |
| PAY-006 | Track basic remittance/payment status such as `submitted`, `reviewing`, `paid`, and `rejected`. | P1 |
| PAY-007 | Provide a list/history command such as `/receipt-list` or `/remittance-history` filtered by requester or status. | P1 |
| PAY-008 | Return clear responses for accepted, rejected, duplicate, unsupported file, and internal error cases. | P0 |

#### Discussion Needed

| Topic | Decision Needed |
| --- | --- |
| Source of truth | Decide whether receipt/remittance records live in PostgreSQL, Google Sheets, or both. |
| OCR scope | Decide whether OCR is required in MVP or whether manual metadata is enough for first validation. |
| Minimum fields | Decide required financial fields: vendor, amount, currency, transaction date, payment method, remittance date, and memo. |
| File policy | Decide supported MIME types, max file size, and max attachment count. |
| Permissions | Decide who can submit receipts and who can mark records paid or rejected. |
| Notifications | Decide whether paid/unpaid reminders go to the same channel, a private channel, or direct messages. |

### Todo and Schedule Management

#### Confirmed Implementation Items

| ID | Requirement | Priority |
| --- | --- | --- |
| TODO-001 | Provide a todo creation command such as `/todo-add`. | P0 |
| TODO-002 | Capture title, optional description, optional due date/time, and optional assignee. | P0 |
| TODO-003 | Use a modal when title plus description plus due date exceeds comfortable slash command input. | P0 |
| TODO-004 | Validate required title, maximum text length, date/time format, and assignee format. | P0 |
| TODO-005 | Store task metadata: requester, assignee, source Discord interaction ID, status, due date/time, created time, and updated time. | P0 |
| TODO-006 | Provide list and completion commands such as `/todo-list` and `/todo-done`. | P1 |
| TODO-007 | Provide a schedule command such as `/schedule-add` when the item has a date/time but may not be a task. | P1 |
| TODO-008 | Return empty-state, created, updated, completed, invalid date, missing title, and not-found responses. | P0 |

#### Discussion Needed

| Topic | Decision Needed |
| --- | --- |
| Todo vs schedule split | Decide whether scheduled items are a todo subtype or a separate calendar-like record. |
| External sync | Decide whether MVP syncs to Google Calendar, Google Sheets, another task system, or no external system. |
| Status model | Decide whether MVP uses only `open`/`done` or includes `blocked`, `cancelled`, and `overdue`. |
| Assignee mapping | Decide whether Discord users map directly to assignees or require a separate user profile table. |
| Reminder policy | Decide whether due reminders are in MVP, and if so when and where they are sent. |

## Discord Interaction Constraints

### Slash Commands

- Slash commands are the primary command discovery and execution surface.
- Command options should stay short and structured: strings, numbers, booleans,
  users, channels, and choices.
- Use slash command options for simple required inputs.
- Use autocomplete only for bounded values that the bot can resolve quickly.
- Keep command names domain-scoped and predictable, for example
  `/sns-draft`, `/receipt-add`, `/todo-add`.
- Discord interactions must be acknowledged quickly. Long work should respond
  with an accepted/processing message and complete asynchronously or through a
  follow-up message.

### Modals and Forms

- Use modals when the command needs multiple text fields or long free-form text.
- Modals are suitable for SNS draft text, receipt memo/details, and richer todo
  descriptions.
- Modals do not replace attachment upload. If a flow requires a file, the bot
  still needs an attachment-aware entry point and clear user instructions.
- Validate modal submissions the same way as slash command inputs.
- Modal field labels and error messages should use Korean first unless the
  command explicitly chooses another language policy.

### Attachments

- Attachment workflows must validate:
  - attachment is present when required,
  - content type or filename extension is supported,
  - file size is within the configured limit,
  - attachment count is within the configured limit,
  - the bot can retrieve the file before handing off to the domain handler.
- Store attachment metadata separately from downloaded file content.
- Do not assume Discord-hosted attachment URLs are permanent storage.
- Do not log raw file content or sensitive receipt data.
- For unsupported or oversized files, return an actionable message that tells
  the user which formats and limits are accepted.

## Cross-Domain Requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| CORE-001 | Reject commands outside configured channels before domain handlers run. | P0 |
| CORE-002 | Keep domain handlers independent from Discord SDK types behind a small command/input boundary. | P0 |
| CORE-003 | Normalize user-visible responses across success, validation failure, permission failure, duplicate request, and internal error. | P0 |
| CORE-004 | Keep secrets in environment variables or secret storage only. | P0 |
| CORE-005 | Provide fake/local integration boundaries for tests where external credentials are unavailable. | P1 |
| CORE-006 | Add tests for validation, routing, duplicate interaction handling, and response formatting when implementation begins. | P0 |

## Acceptance Criteria

1. The MVP command inventory covers SNS upload, receipt/remittance history, and
   todo/schedule management.
2. Confirmed implementation items and discussion-needed items are visibly
   separated by domain.
3. Discord slash command, modal/form, and attachment constraints are documented.
4. Open decisions are explicit enough to become follow-up issues.
5. No implementation work is required by this document alone.
