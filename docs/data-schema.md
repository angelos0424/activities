# 데이터 스키마

이 문서는 로컬 Discord bot, SQLite, 로컬 파일, Google Sheets의 MVP 데이터 구조를 한곳에 모은다.

## 저장소별 책임

| 저장소 | 책임 |
| --- | --- |
| SQLite | 로컬 bot config, command audit log, 로컬 파일 metadata, Discord interaction metadata, 가벼운 request state |
| Google Sheets | 사람이 직접 보고 수정할 수 있는 운영 기록 |
| 로컬 filesystem | 업로드된 영수증 이미지와 향후 선택적 SNS source asset. 나중에 Google Drive로 sync 또는 migration할 수 있음 |
| Discord | 명령어 실행 위치와 사용자-facing 상태 메시지. source of truth로 보지 않는다. |

## SQLite

SQLite database path:

```text
data/activities.sqlite
```

SQLite를 범위에 포함하는 이유:

1. PR #109의 Discord bot MVP 방향은 deferred 상태인 PostgreSQL/Spring web stack 없이도 config, command audit log, file metadata, retry/idempotency tracking을 위한 로컬 bot state가 필요하다.
2. 한 줄 요약: SQLite는 RDBMS이지만 PostgreSQL/MySQL처럼 별도 database server로 실행하지 않고, 로컬 bot process가 사용하는 embedded single-file database다.
3. SQLite는 사람이 보는 운영 기록용 Google Sheets를 대체하지 않는다. Sheets는 계속 행정 담당자가 수정할 수 있는 surface다.
4. MVP가 나중에 multi-user server-side workflow를 필요로 하면 SQLite schema는 PostgreSQL 또는 다른 hosted RDBMS로 옮길 migration source로 다룬다.

### `bot_config`

Bot 명령어로 변경되는 runtime config를 저장한다.

| Column | 타입 | 필수 | 메모 |
| --- | --- | --- | --- |
| key | text | yes | Primary key |
| value | text | yes | Config value |
| updated_by | text | yes | Discord user id |
| updated_at | text | yes | ISO timestamp |

예상 key:

| Key | 메모 |
| --- | --- |
| `receipt-manager.people_sheet_url` | People Sheet URL 또는 ID |
| `receipt-manager.transfers_sheet_url` | Transfers Sheet URL 또는 ID |
| `receipt-manager.storage_dir` | 기본값: `data/receipts` |
| `receipt-manager.admin_role_id` | Sheet config를 변경할 수 있는 Discord role |
| `sns-manager.homepage_target` | Homepage adapter config placeholder |
| `todo-manager.storage_mode` | 초기값은 `sqlite` 또는 `sheets` |

### `local_files`

로컬 파일 metadata를 저장한다. 영수증 이미지 파일은 로컬 PC filesystem에 접근할 수 있는 사용자가 볼 수 있다.

| Column | 타입 | 필수 | 메모 |
| --- | --- | --- | --- |
| id | text | yes | Generated id |
| service | text | yes | `receipt-manager`, `sns-manager`, `todo-manager` |
| local_path | text | yes | `data/` 아래 상대 경로 |
| original_filename | text | no | Discord attachment 원본 파일명 |
| mime_type | text | yes | Attachment MIME type |
| size_bytes | integer | yes | Attachment size |
| discord_attachment_id | text | no | 가능하면 Discord attachment id 저장 |
| discord_message_id | text | no | 가능하면 source message id 저장 |
| created_by | text | yes | Discord user id |
| created_at | text | yes | ISO timestamp |

### `command_audit_log`

운영 디버깅과 확인을 위해 command 시도를 기록한다.

| Column | 타입 | 필수 | 메모 |
| --- | --- | --- | --- |
| id | text | yes | Generated id |
| service | text | yes | `sns-manager`, `receipt-manager`, `todo-manager` |
| command | text | yes | Slash command name |
| discord_guild_id | text | yes | Discord server id |
| discord_channel_id | text | yes | Discord channel id |
| discord_user_id | text | yes | 실행자 |
| status | text | yes | `started`, `success`, `failed`, `cancelled` |
| retry_count | integer | yes | 외부 작업 재시도 횟수 |
| safe_error_message | text | no | 사용자에게 보여줄 수 있는 실패 문구 |
| created_at | text | yes | ISO timestamp |
| finished_at | text | no | ISO timestamp |

### `sns_posts`

`sns-manager` 요청을 추적한다.

| Column | 타입 | 필수 | 메모 |
| --- | --- | --- | --- |
| id | text | yes | Generated id |
| discord_guild_id | text | yes | Discord server id |
| discord_channel_id | text | yes | `#sns` channel id |
| requested_by | text | yes | Discord user id |
| title | text | yes | 게시 제목 |
| content | text | yes | 게시 본문 |
| homepage_type | text | no | `notice`, `gallery`, 또는 null |
| status | text | yes | `draft`, `processing`, `partial_success`, `success`, `failed` |
| created_at | text | yes | ISO timestamp |
| updated_at | text | yes | ISO timestamp |

### `sns_post_targets`

Target별 업로드 상태를 추적한다.

| Column | 타입 | 필수 | 메모 |
| --- | --- | --- | --- |
| id | text | yes | Generated id |
| post_id | text | yes | `sns_posts.id` 참조 |
| target | text | yes | `instagram`, `facebook`, `homepage` |
| status | text | yes | `pending`, `processing`, `success`, `failed`, `manual_required`, `skipped` |
| result_url | text | no | 결과 URL |
| safe_error_message | text | no | 사용자에게 보여줄 수 있는 실패 문구 |
| retry_count | integer | yes | 0~3 |
| updated_at | text | yes | ISO timestamp |

### `todo_items`

`todo-manager`는 discovery 결과가 Google Sheets 쪽으로 기울지 않으면 초기 저장소로 SQLite를 쓸 수 있다.

| Column | 타입 | 필수 | 메모 |
| --- | --- | --- | --- |
| id | text | yes | Generated id |
| title | text | yes | 일정/todo 제목 |
| description | text | no | 상세 내용 |
| starts_at | text | yes | parse된 경우 ISO timestamp |
| ends_at | text | no | ISO timestamp |
| estimated_duration_minutes | integer | no | 예상 소요 시간 |
| location_name | text | no | 장소명 |
| location_address | text | no | 주소 또는 지도 검색어 |
| related_party_id | text | no | 연결된 사람/단체 id |
| type | text | yes | `meeting`, `meetup`, `project`, `admin`, `other` |
| status | text | yes | `wait`, `progress`, `done`, `dismiss` |
| result_note | text | no | 완료 메모 |
| result_link | text | no | 완료 링크 |
| created_by | text | yes | Discord user id |
| created_at | text | yes | ISO timestamp |
| updated_at | text | yes | ISO timestamp |

## 로컬 파일

영수증 이미지는 아래 경로에 저장한다.

```text
data/receipts/{yyyy}/{MM}/{HHMMSS}/{fileid}
```

규칙:

1. `yyyy`, `MM`, `HHMMSS`는 영수증 upload 시간을 기준으로 한다.
2. `fileid`는 bot이 생성하며, 사용자가 올린 원본 파일명을 포함하면 안 된다.
3. 사용자의 원본 파일명은 metadata로만 저장한다.
4. Sheets에 기록하는 경로는 project root 기준 상대 경로로 둔다.
5. MVP에서는 로컬 PC filesystem 접근을 접근 모델로 본다. 해당 PC/user account에 접근할 수 있는 사람은 파일에 접근할 수 있다.
6. 로컬 filesystem 경로는 나중에 Google Drive로 sync 또는 migration할 수 있도록 단순하게 유지한다.

## Google Sheets

### People Sheet

| Column | 필수 | 메모 |
| --- | --- | --- |
| person_id | yes | Generated id |
| type | yes | `person`, `organization` |
| name | yes | 검색 key |
| contact | yes | 전화번호/email/free text |
| account | no | 은행/예금주/계좌번호 |
| created_at | yes | ISO timestamp |
| updated_at | yes | ISO timestamp |

### Transfers Sheet

| Column | 필수 | 메모 |
| --- | --- | --- |
| transfer_id | yes | Generated id |
| person_id | yes | 연결된 person/org |
| name | yes | 사람이 읽기 쉽게 복사한 이름 |
| account | no | People Sheet에서 복사한 계좌 정보 |
| amount | no | 금액 입력/OCR 결정 전까지 optional |
| status | yes | `송금전`, `완료`, `보류` |
| receipt_local_path | no | `data/receipts/{yyyy}/{MM}/{HHMMSS}/{fileid}` |
| receipt_original_filename | no | 업로드된 원본 파일명 |
| receipt_mime_type | no | 이미지 MIME type |
| requested_by | yes | Discord user id |
| created_at | yes | ISO timestamp |
| completed_at | no | 수동 입력 또는 향후 sync |

## 재시도와 실패 상태

외부 작업은 최종 실패 전 2~3번 재시도한다.

| 작업 | 재시도 | Idempotency 규칙 |
| --- | --- | --- |
| Google Sheets read | yes | 재시도해도 안전 |
| Google Sheets append | yes | generated id로 논리적 중복 row 방지 |
| 로컬 파일 저장 | yes | 같은 fileid를 재사용하고 retry마다 새 파일명을 만들지 않음 |
| `sns-manager` | yes | target별 재시도. 이미 성공한 target은 다시 업로드하지 않음 |
| Discord 응답 update | yes | update 실패 시 로컬에 기록하고 종료 |
