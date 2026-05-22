# Activities 기술 스택

## 범위

이 문서는 로컬 Discord bot MVP의 기술 스택을 정의한다.

기존 React/Spring/PostgreSQL scaffold는 repository에 남겨두지만 첫 구현 대상은 아니다.
첫 구현 대상은 Docker Compose로 로컬에서 실행하는 Discord bot이며, 하나의 Discord
서버 안에서 서비스별 채널을 처리한다.

| 채널 | 서비스 |
| --- | --- |
| `#sns` | `sns-manager` |
| `#receipt` | `receipt-manager` |
| `#todo` | `todo-manager` |

## MVP 스택

| 계층 | 선택 | 메모 |
| --- | --- | --- |
| Bot 실행 환경 | Node.js + TypeScript | Discord command handler의 공통 실행 환경 |
| Discord SDK | `discord.js` | Slash command, modal, button, attachment 처리 |
| Google Sheets API | `googleapis` | People Sheet, Transfers Sheet, 서비스 로그 |
| 로컬 상태 | SQLite | Bot 설정, Sheet URL, command metadata, 로컬 파일 metadata, retry/idempotency state |
| 로컬 파일 저장소 | Filesystem | 업로드된 영수증과 서비스 파일. 나중에 Google Drive로 sync 또는 migration 가능 |
| 실행 방식 | Docker Compose | 로컬 운영과 재시작 가능한 서비스 정의 |

## 로컬 파일 저장

영수증 이미지는 아래 경로에 저장한다.

```text
data/receipts/{yyyy}/{MM}/{HHMMSS}/{fileid}
```

규칙:

1. `yyyy`, `MM`, `HHMMSS`는 영수증 upload 시간을 기준으로 한다.
2. `fileid`는 bot이 생성해야 한다.
3. 사용자가 업로드한 원본 파일명은 저장 경로에 직접 쓰지 않는다.
4. 원본 파일명은 SQLite 또는 Google Sheets metadata로만 저장할 수 있다.
5. bot은 없는 연/월/시간 디렉터리를 생성해야 한다.
6. 저장 디렉터리에 쓸 수 없으면 Google Sheets에 row를 쓰기 전에 영수증 업로드를 실패 처리한다.
7. 이 로컬 filesystem layout은 나중에 Google Drive로 sync 또는 migration할 수 있을 만큼 portable해야 한다.

## SQLite 책임

SQLite는 Discord 메시지나 Google Sheets 포맷에 의존하면 안 되는 로컬 bot 상태를 저장한다.

SQLite를 포함하는 이유는 현재 Discord bot MVP가 local-first이기 때문이다. Bot은 deferred 상태인 PostgreSQL/Spring stack 없이 durable config, audit log, file metadata, retry/idempotency state를 필요로 한다. 한 줄로 말하면 SQLite는 다른 RDBMS처럼 관계형 database지만, 별도 database server가 아니라 단일 로컬 파일로 embedded되어 실행된다.

최소 테이블:

- `bot_config`
  - `key`
  - `value`
  - `updated_by`
  - `updated_at`
- `local_files`
  - `id`
  - `service`
  - `local_path`
  - `original_filename`
  - `mime_type`
  - `size_bytes`
  - `created_by`
  - `created_at`
- `command_audit_log`
  - `id`
  - `service`
  - `command`
  - `discord_user_id`
  - `discord_channel_id`
  - `status`
  - `created_at`

전체 MVP schema는 `docs/data-schema.md`를 따른다.

## 실패 처리

외부 작업은 사용자 flow를 실패 처리하기 전에 작은 재시도 loop를 거친다.

규칙:

1. Google Sheets read/write, 로컬 파일 저장, `sns-manager` 업로드, Discord 메시지 update는 2~3번 재시도할 수 있다.
2. 최종 실패하면 bot은 사용자가 이해할 수 있는 안내 메시지를 반환하고 flow를 종료한다.
3. 재시도는 idempotent해야 한다. 같은 Sheets row, 로컬 파일, `sns-manager` post를 중복 생성하면 안 된다.
4. 내부 오류는 SQLite `command_audit_log`에 기록한다.
5. Discord 응답에는 token, credential, stack trace, 로컬 absolute path를 노출하지 않는다.

## Docker Compose 책임

Docker Compose는 data directory를 mount한 로컬 bot을 실행해야 한다.

예상 mount path:

```text
./data:/app/data
```

예상 environment:

```text
DISCORD_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_GUILD_ID=
GOOGLE_APPLICATION_CREDENTIALS=/app/data/google-service-account.json
SQLITE_PATH=/app/data/activities.sqlite
RECEIPT_STORAGE_DIR=/app/data/receipts
```

## 보류된 스택

아래 항목은 Discord bot이 실제 사용성을 증명한 뒤 재검토한다.

- React dashboard
- Spring Boot API 확장
- PostgreSQL product persistence
- S3 또는 cloud object storage
- Hosted multi-tenant deployment
- KakaoTalk automation

## 미결정 사항

1. 장기적으로 서비스 데이터를 Google Sheets/SQLite에서 PostgreSQL로 옮길 것인가?
2. `sns-manager` asset도 영수증과 같은 filesystem pattern을 쓸 것인가?
3. 로컬 filesystem을 먼저 Google Drive로 sync할 것인가, 아니면 Google Drive storage adapter로 교체할 것인가?
4. `todo-manager`는 긴 목록과 지도 중심 flow 때문에 web/mobile companion UI가 필요한가?
