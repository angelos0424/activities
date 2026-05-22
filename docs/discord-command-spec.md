# Discord Command Spec

This document is the shared slash command contract for the local Activities Discord bot.

The bot runs in one Discord server and separates services by channel:

| Channel | Service | Commands |
| --- | --- | --- |
| `#sns` | SNS upload | `/post` |
| `#receipt` | Receipt and transfer status | `/receipt add`, `/receipt check`, `/receipt sheet status`, `/receipt sheet set` |
| `#todo` | Todo and schedule | `/todo add`, `/todo list`, `/todo status` |

## Shared Rules

1. Commands must validate that they are being used in the expected service channel.
2. Commands that call Google Sheets, upload files, or post to external services must defer the Discord interaction before long work starts.
3. Failed external operations should be retried 2 to 3 times before the bot returns a final failure message and ends the flow.
4. Retry loops must not create duplicate Google Sheets rows, duplicate local files, or duplicate SNS posts.
5. Final failure messages should be short, user-readable, and include the next manual action.
6. Internal stack traces, tokens, Google credentials, and local absolute paths must not be posted to Discord.
7. Channel-specific commands should use service namespaces where possible to avoid collisions.

## `/post`

Service: SNS upload
Channel: `#sns`

### Purpose

Start a multi-target post upload flow for Instagram, Facebook, and/or the homepage.

### Input

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| targets | multi-select | yes | `instagram`, `facebook`, `homepage` |
| homepage_type | select | conditional | Required when `homepage` is selected. Values: `notice`, `gallery`. |
| title | text | yes | Post title. |
| content | text | yes | Post body. |
| assets | attachments | yes | Image files and/or mp4 files. Multiple files allowed. |

### Preferred Discord UX

1. User runs `/post`.
2. Bot opens a modal/form for title and content.
3. Bot asks for target selection using select/menu controls or buttons.
4. Bot asks for image/mp4 attachments.
5. Bot posts a per-target progress message.
6. Bot returns result URLs or final failure messages.

### Fallback Discord UX

If modal file upload is not stable in the chosen Discord SDK version:

1. `/post` collects title, content, target, and homepage type.
2. Bot replies: `이미지/영상 파일을 이 메시지에 reply로 업로드해주세요.`
3. Bot collects attachments from the reply/thread.
4. Bot continues the upload flow.

### Success Response

The bot returns one result block per target:

```text
업로드 결과
- Homepage: 완료 https://...
- Instagram: 완료 https://...
- Facebook: 수동 업로드 필요
```

### Failure Response

After 2 to 3 retries:

```text
Instagram 업로드 실패
사유: 권한 또는 API 설정을 확인해야 합니다.
다음 조치: 아래 준비된 문구와 파일로 수동 업로드해주세요.
```

## `/receipt add`

Service: Receipt
Channel: `#receipt`

### Purpose

Create a transfer row for a person or organization and attach a locally stored receipt image.

### Input

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| name | text | yes | Person or organization name to search in People Sheet. |

### Flow

1. User runs `/receipt add name:"..."`.
2. Bot searches People Sheet.
3. If one or more matches exist, bot shows candidates with confirm/select buttons.
4. If no match exists, bot opens a new person/org form.
5. Bot creates a Transfers Sheet row with status `송금전`.
6. Bot asks the user to upload the receipt image.
7. Bot saves the image to `data/receipts/{yyyy}/{MM}/{generated_filename}`.
8. Bot records file metadata and links the local path to the transfer row.
9. Bot returns the created transfer summary.

### New Person/Org Form

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| name | text | yes | Defaults to searched name. |
| type | select | yes | `person`, `organization` |
| contact | text | yes | Free text. |
| account | text | no | Bank/account holder/account number. |

### Success Response

```text
영수증 등록 완료
- 이름: 홍길동
- 상태: 송금전
- 저장 위치: data/receipts/2026/05/...
```

### Failure Response

After 2 to 3 retries:

```text
영수증 등록 실패
사유: Google Sheets에 송금 이력을 저장하지 못했습니다.
다음 조치: 잠시 후 다시 시도하거나 담당자에게 수기 등록을 요청해주세요.
```

## `/receipt check`

Service: Receipt
Channel: `#receipt`

### Purpose

Summarize transfer rows and show how many are not complete.

### Input

No required input.

Optional future filters:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| status | select | no | `송금전`, `보류`, `완료`, `all` |
| limit | integer | no | Max incomplete rows to show. |

### Response

```text
송금 현황
- 전체: 18건
- 미완료: 4건

미완료 목록
1. 홍길동 / 송금전 / 2026-05-22
2. 활동팀 / 보류 / 2026-05-21
```

## `/receipt sheet status`

Service: Receipt
Channel: `#receipt`

### Purpose

Show the currently configured People Sheet and Transfers Sheet.

### Response

```text
Receipt Sheets
- People Sheet: 설정됨
- Transfers Sheet: 설정됨
- 마지막 변경: 2026-05-22 by @admin
```

## `/receipt sheet set`

Service: Receipt
Channel: `#receipt`

### Purpose

Update receipt-related Google Sheets URLs.

### Input

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| people | url/text | yes | People Sheet URL or Sheet ID. |
| transfers | url/text | yes | Transfers Sheet URL or Sheet ID. |

### Permission

This command is admin-only. The exact Discord role name is an implementation config value.

### Flow

1. Validate user permission.
2. Validate both URLs or IDs.
3. Check that the Google service account can read/write both sheets.
4. Store values in SQLite `bot_config`.
5. Return confirmation.

## `/todo add`

Service: Todo
Channel: `#todo`

### Purpose

Create a schedule/todo item.

### Input

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| title | text | yes | Schedule/todo title. |
| description | text | no | Details. |
| starts_at | datetime/text | yes | MVP may accept text then normalize later. |
| estimated_duration_minutes | integer | no | Expected duration. |
| location_name | text | no | Place name. |
| location_address | text | no | Address or map search text. |
| related_party | text/select | no | Person or organization. |
| type | select | yes | `meeting`, `meetup`, `project`, `admin`, `other` |

### Response

```text
일정 등록 완료
- 제목: 운영 회의
- 시간: 2026-05-22 19:00
- 상태: wait
```

## `/todo list`

Service: Todo
Channel: `#todo`

### Purpose

Show upcoming and incomplete schedule/todo items.

### Input

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| range | select | no | `today`, `week`, `all`. Default: `today`. |
| status | select | no | `wait`, `progress`, `done`, `dismiss`, `open`. Default: `open`. |
| type | select | no | Optional type filter. |

### Sorting

1. Today's items first.
2. Earlier `starts_at` first.
3. `wait` and `progress` before `done` and `dismiss`.

## `/todo status`

Service: Todo
Channel: `#todo`

### Purpose

Update a schedule/todo status.

### Input

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| item | text/select | yes | Item id or selected item. |
| status | select | yes | `wait`, `progress`, `done`, `dismiss` |
| result_note | text | no | Required later for some done flows if needed. |
| result_link | text | no | Optional output link. |

### Response

```text
상태 변경 완료
- 운영 회의: progress
```
