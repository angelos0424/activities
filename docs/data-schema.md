# Data Schema

This document centralizes the MVP data shape for the local Discord bot, SQLite, local files, and Google Sheets.

## Storage Responsibilities

| Store | Responsibility |
| --- | --- |
| SQLite | Local bot config, command audit log, local file metadata, Discord interaction metadata, and lightweight request state. |
| Google Sheets | Human-readable operation records that admins can edit directly. |
| Local filesystem | Uploaded receipt images and, later, optional SNS source assets. This may be synced or migrated to Google Drive later. |
| Discord | Command surface and user-facing status messages. Discord is not the source of truth. |

## SQLite

SQLite database path:

```text
data/activities.sqlite
```

Why SQLite is in scope:

1. Source: PR 109's Discord bot MVP direction needs local bot state for config, command audit logs, file metadata, and retry/idempotency tracking without requiring the deferred PostgreSQL/Spring web stack.
2. One-line summary: SQLite is still an RDBMS, but it is an embedded single-file database used by the local bot process instead of a separate database server like PostgreSQL/MySQL.
3. SQLite is not intended to replace Google Sheets for human-facing operations records; Sheets remains the editable admin surface.
4. If the MVP later needs multi-user server-side workflows, the SQLite schema should be treated as a migration source for PostgreSQL or another hosted RDBMS.

### `bot_config`

Stores runtime config changed through bot commands.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| key | text | yes | Primary key. |
| value | text | yes | Config value. |
| updated_by | text | yes | Discord user id. |
| updated_at | text | yes | ISO timestamp. |

Expected keys:

| Key | Notes |
| --- | --- |
| `receipt.people_sheet_url` | People Sheet URL or ID. |
| `receipt.transfers_sheet_url` | Transfers Sheet URL or ID. |
| `receipt.storage_dir` | Defaults to `data/receipts`. |
| `receipt.admin_role_id` | Discord role allowed to update sheet config. |
| `sns.homepage_target` | Homepage adapter config placeholder. |
| `todo.storage_mode` | Initial value can be `sqlite` or `sheets`. |

### `local_files`

Stores local file metadata. Receipt image files are visible to users who can access the local PC filesystem.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| id | text | yes | Generated id. |
| service | text | yes | `receipt`, `sns`, `todo`. |
| local_path | text | yes | Relative path under `data/`. |
| original_filename | text | no | Original Discord attachment filename. |
| mime_type | text | yes | MIME type from attachment. |
| size_bytes | integer | yes | Attachment size. |
| discord_attachment_id | text | no | Discord attachment id if available. |
| discord_message_id | text | no | Source message id if available. |
| created_by | text | yes | Discord user id. |
| created_at | text | yes | ISO timestamp. |

### `command_audit_log`

Records command attempts for debugging and operational review.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| id | text | yes | Generated id. |
| service | text | yes | `sns`, `receipt`, `todo`. |
| command | text | yes | Slash command name. |
| discord_guild_id | text | yes | Discord server id. |
| discord_channel_id | text | yes | Discord channel id. |
| discord_user_id | text | yes | Actor. |
| status | text | yes | `started`, `success`, `failed`, `cancelled`. |
| retry_count | integer | yes | Number of external-operation retries. |
| safe_error_message | text | no | User-safe failure text. |
| created_at | text | yes | ISO timestamp. |
| finished_at | text | no | ISO timestamp. |

### `sns_posts`

Tracks SNS upload requests.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| id | text | yes | Generated id. |
| discord_guild_id | text | yes | Discord server id. |
| discord_channel_id | text | yes | `#sns` channel id. |
| requested_by | text | yes | Discord user id. |
| title | text | yes | Post title. |
| content | text | yes | Post body. |
| homepage_type | text | no | `notice`, `gallery`, or null. |
| status | text | yes | `draft`, `processing`, `partial_success`, `success`, `failed`. |
| created_at | text | yes | ISO timestamp. |
| updated_at | text | yes | ISO timestamp. |

### `sns_post_targets`

Tracks per-target upload status.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| id | text | yes | Generated id. |
| post_id | text | yes | References `sns_posts.id`. |
| target | text | yes | `instagram`, `facebook`, `homepage`. |
| status | text | yes | `pending`, `processing`, `success`, `failed`, `manual_required`, `skipped`. |
| result_url | text | no | Result URL if available. |
| safe_error_message | text | no | User-safe failure text. |
| retry_count | integer | yes | 0 to 3. |
| updated_at | text | yes | ISO timestamp. |

### `todo_items`

Initial Todo storage can be SQLite unless discovery shows Google Sheets is better.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| id | text | yes | Generated id. |
| title | text | yes | Schedule/todo title. |
| description | text | no | Details. |
| starts_at | text | yes | ISO timestamp if parsed. |
| ends_at | text | no | ISO timestamp. |
| estimated_duration_minutes | integer | no | Expected duration. |
| location_name | text | no | Place name. |
| location_address | text | no | Address or map search text. |
| related_party_id | text | no | Person/org id if linked. |
| type | text | yes | `meeting`, `meetup`, `project`, `admin`, `other`. |
| status | text | yes | `wait`, `progress`, `done`, `dismiss`. |
| result_note | text | no | Completion note. |
| result_link | text | no | Completion link. |
| created_by | text | yes | Discord user id. |
| created_at | text | yes | ISO timestamp. |
| updated_at | text | yes | ISO timestamp. |

## Local Files

Receipt images are stored at:

```text
data/receipts/{yyyy}/{MM}/{HHMMSS}/{fileid}
```

Rules:

1. `yyyy`, `MM`, and `HHMMSS` use the receipt upload time.
2. `fileid` is generated by the bot and must not include the user's original filename.
3. The user's original filename is metadata only.
4. The path written to Sheets should be relative to the project data directory.
5. For MVP, local PC filesystem access is the access model. Anyone with access to that PC/user account can access these files.
6. The local filesystem path is intentionally kept simple so it can later be synced or migrated to Google Drive without changing command behavior.

## Google Sheets

### People Sheet

| Column | Required | Notes |
| --- | --- | --- |
| person_id | yes | Generated id. |
| type | yes | `person`, `organization`. |
| name | yes | Search key. |
| contact | yes | Phone/email/free text. |
| account | no | Bank/account holder/account number. |
| created_at | yes | ISO timestamp. |
| updated_at | yes | ISO timestamp. |

### Transfers Sheet

| Column | Required | Notes |
| --- | --- | --- |
| transfer_id | yes | Generated id. |
| person_id | yes | Linked person/org. |
| name | yes | Copied for readability. |
| account | no | Copied from People Sheet if available. |
| amount | no | Optional until amount input/OCR is decided. |
| status | yes | `송금전`, `완료`, `보류`. |
| receipt_local_path | no | `data/receipts/{yyyy}/{MM}/{HHMMSS}/{fileid}`. |
| receipt_original_filename | no | Original uploaded filename. |
| receipt_mime_type | no | Image MIME type. |
| requested_by | yes | Discord user id. |
| created_at | yes | ISO timestamp. |
| completed_at | no | Filled manually or by future sync. |

## Retry and Failure State

External operations should retry 2 to 3 times before final failure:

| Operation | Retry? | Idempotency rule |
| --- | --- | --- |
| Google Sheets read | yes | Safe to retry. |
| Google Sheets append | yes | Use generated ids to avoid duplicate logical rows. |
| Local file save | yes | Use generated filename once; do not create new filenames per retry. |
| SNS upload | yes | Retry per target; do not retry already successful targets. |
| Discord response update | yes | If update fails, log locally and stop. |
