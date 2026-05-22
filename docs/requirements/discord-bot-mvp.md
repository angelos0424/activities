# Discord Bot MVP 요구사항

## 목적

SNS 서비스를 포함한 Activities Discord bot MVP의 최소 요구사항을 정의한다. MVP는 사용자가 설정된 Discord 채널에서 slash command, modal form, file attachment로 운영 workflow를 실행할 수 있게 한다.

이 문서는 구현 대상으로 확정된 항목과, 구현 전에 제품/기술 결정을 더 해야 하는 항목을 분리한다.

## MVP 범위

### 구현 확정 항목

| 영역 | 요구사항 | 우선순위 |
| --- | --- | --- |
| Discord 접근 | Bot command는 설정된 Discord guild/channel에서만 실행된다. | P0 |
| Command surface | MVP의 기본 진입점은 Discord slash command다. | P0 |
| Form | slash command option만으로 부족한 구조화 입력은 Discord modal을 사용한다. | P0 |
| Attachment | 파일 기반 workflow는 Discord attachment를 받고, domain 처리 전에 파일 type/size/presence를 검증한다. | P0 |
| 응답 | 모든 command는 시작, 성공, 검증 실패, 내부 오류를 명확히 응답한다. | P0 |
| 감사 가능성 | command name, requester, channel, attachment metadata, result status, timestamp를 저장하거나 log로 남긴다. | P1 |
| Idempotency | Discord interaction이 반복 전달되어도 같은 외부 side effect를 중복 생성하지 않는다. | P1 |

### MVP에 포함하지 않는 것

| 항목 | 이유 |
| --- | --- |
| Web UI | MVP는 Discord 안에서 먼저 검증한다. |
| Mobile app packaging | Discord가 첫 client surface다. |
| Multi-tenant admin console | MVP 검증에는 설정된 guild/channel ID로 충분하다. |
| 전체 승인 workflow | 먼저 intake와 status tracking을 검증하고, approval state machine은 이후 추가한다. |
| 확인 없는 직접 게시 | SNS publish는 실제 계정 write 전에 승인 결정을 먼저 해야 안전하다. |

## 상위 Flow

```text
Discord 사용자
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
Storage 또는 integration boundary
  |
  | persisted record, draft, status, external write
  v
Discord 응답
```

## Domain 요구사항

### SNS 업로드

#### 구현 확정 항목

| ID | 요구사항 | 우선순위 |
| --- | --- | --- |
| SNS-001 | `/sns-upload`, `/sns-draft`, 또는 확정된 `/post` 같은 SNS content intake command를 제공한다. | P0 |
| SNS-002 | title/topic/body와 target platform/channel에 필요한 text field를 받는다. | P0 |
| SNS-003 | Discord가 제공하는 경우 optional image/media attachment metadata를 지원한다. | P1 |
| SNS-004 | 필수 content, 최대 길이, target platform, attachment presence/type을 처리 전 검증한다. | P0 |
| SNS-005 | 요청 text, 선택 target, warning, 다음 action을 포함한 Discord preview를 반환한다. | P0 |
| SNS-006 | 기본 MVP 동작은 live publishing이 아니라 draft/intake다. | P0 |
| SNS-007 | requester, source Discord message/interaction ID, target platform, draft content, attachment metadata, status를 기록한다. | P1 |

#### 결정 필요

| 주제 | 필요한 결정 |
| --- | --- |
| 첫 target platform | Instagram, X/Twitter, Threads, LinkedIn, 또는 다른 platform 중 첫 target 결정 |
| Publish 방식 | MVP가 draft 생성에서 멈출지, 승인된 live publishing까지 포함할지 결정 |
| 승인 담당자 | live publishing이 범위에 들어오면 누가 승인할 수 있는지 결정 |
| Brand rule | 톤, 금지어, hashtag rule, media requirement가 MVP에 필요한지 결정 |
| 저장소 | SNS draft가 PostgreSQL, Google Sheets, 또는 다른 system of record에 저장될지 결정 |

### 영수증 및 송금 이력

#### 구현 확정 항목

| ID | 요구사항 | 우선순위 |
| --- | --- | --- |
| PAY-001 | `/receipt-add` 또는 확정된 `/receipt add` 같은 receipt intake command를 제공한다. | P0 |
| PAY-002 | Receipt intake에는 최소 하나의 영수증 attachment가 필요하다. | P0 |
| PAY-003 | optional memo와 payment/remittance reference field를 slash option 또는 modal로 받는다. | P0 |
| PAY-004 | 저장 전 지원 파일 type, file size, attachment count, missing attachment를 검증한다. | P0 |
| PAY-005 | requester, Discord message/interaction ID, attachment name, content type, size, memo, status, created time을 저장한다. | P0 |
| PAY-006 | `submitted`, `reviewing`, `paid`, `rejected` 같은 기본 송금/지급 status를 추적한다. | P1 |
| PAY-007 | requester 또는 status로 filter 가능한 `/receipt-list` 또는 `/remittance-history` 같은 목록 command를 제공한다. | P1 |
| PAY-008 | accepted, rejected, duplicate, unsupported file, internal error에 대한 명확한 응답을 반환한다. | P0 |

#### 결정 필요

| 주제 | 필요한 결정 |
| --- | --- |
| 원본 저장소 | 영수증/송금 기록이 PostgreSQL, Google Sheets, 또는 둘 다에 저장될지 결정 |
| OCR 범위 | MVP에 OCR이 필수인지, 첫 검증은 수동 metadata로 충분한지 결정 |
| 최소 필드 | vendor, amount, currency, transaction date, payment method, remittance date, memo 중 필수 field 결정 |
| 파일 정책 | 지원 MIME type, 최대 file size, 최대 attachment count 결정 |
| 권한 | 누가 영수증을 제출하고, 누가 paid/rejected 처리할 수 있는지 결정 |
| 알림 | 지급/미지급 reminder가 같은 채널, private channel, DM 중 어디로 갈지 결정 |

### Todo 및 일정 관리

#### 구현 확정 항목

| ID | 요구사항 | 우선순위 |
| --- | --- | --- |
| TODO-001 | `/todo-add` 또는 확정된 `/todo add` 같은 todo creation command를 제공한다. | P0 |
| TODO-002 | title, optional description, optional due date/time, optional assignee를 받는다. | P0 |
| TODO-003 | title, description, due date를 slash command로 받기 불편하면 modal을 사용한다. | P0 |
| TODO-004 | 필수 title, 최대 text length, date/time format, assignee format을 검증한다. | P0 |
| TODO-005 | requester, assignee, source Discord interaction ID, status, due date/time, created time, updated time을 저장한다. | P0 |
| TODO-006 | `/todo-list`, `/todo-done` 또는 확정된 `/todo list`, `/todo status` 같은 목록/완료 command를 제공한다. | P1 |
| TODO-007 | 일정이지만 task가 아닐 수 있는 항목은 `/schedule-add` 같은 command로 분리할 수 있다. | P1 |
| TODO-008 | empty-state, created, updated, completed, invalid date, missing title, not-found 응답을 반환한다. | P0 |

#### 결정 필요

| 주제 | 필요한 결정 |
| --- | --- |
| Todo와 schedule 분리 | scheduled item을 todo subtype으로 둘지, 별도 calendar-like record로 둘지 결정 |
| 외부 sync | Google Calendar, Google Sheets, 다른 task system과 sync할지, 외부 sync 없이 시작할지 결정 |
| Status model | MVP가 `open`/`done`만 쓸지 `blocked`, `cancelled`, `overdue`를 포함할지 결정 |
| Assignee mapping | Discord user를 assignee로 직접 쓸지, 별도 user profile table이 필요한지 결정 |
| Reminder 정책 | due reminder가 MVP에 필요한지, 필요하다면 언제 어디로 보낼지 결정 |

## Discord Interaction 제약

### Slash Command

- Slash command는 기본 command 발견 및 실행 surface다.
- Command option은 string, number, boolean, user, channel, choice처럼 짧고 구조화된 값에 맞춘다.
- 단순한 필수 입력은 slash command option으로 받는다.
- Autocomplete는 bot이 빠르게 resolve할 수 있는 제한된 값에만 사용한다.
- Command 이름은 domain-scoped하고 예측 가능해야 한다. 예: `/sns-draft`, `/receipt-add`, `/todo-add`.
- Discord interaction은 빠르게 acknowledge해야 한다. 긴 작업은 accepted/processing 응답을 먼저 보내고 follow-up message 또는 async 처리로 완료한다.

### Modal과 Form

- 여러 text field나 긴 free-form text가 필요하면 modal을 사용한다.
- Modal은 SNS draft text, receipt memo/details, 긴 todo description에 적합하다.
- Modal은 attachment upload를 대체하지 않는다. 파일이 필요한 flow는 attachment-aware entry point와 명확한 안내가 필요하다.
- Modal submission도 slash command input과 같은 방식으로 검증한다.
- Modal field label과 error message는 별도 language policy가 없으면 한국어를 기본으로 한다.

### Attachment

Attachment workflow는 아래 항목을 검증해야 한다.

- 필수 파일이 실제로 첨부됐는지.
- content type 또는 filename extension이 지원되는지.
- file size가 설정된 제한 안인지.
- attachment count가 설정된 제한 안인지.
- domain handler에 넘기기 전에 bot이 파일을 retrieve할 수 있는지.

Attachment metadata는 다운로드한 file content와 분리해 저장한다.

Discord-hosted attachment URL을 영구 저장소로 가정하지 않는다.

Raw file content나 민감한 영수증 data를 log에 남기지 않는다.

지원하지 않거나 너무 큰 파일은 사용자가 어떤 형식과 제한을 맞춰야 하는지 알 수 있는 안내를 반환한다.

## 공통 Domain 요구사항

| ID | 요구사항 | 우선순위 |
| --- | --- | --- |
| CORE-001 | 설정된 채널 밖의 command는 domain handler 실행 전에 거부한다. | P0 |
| CORE-002 | Domain handler는 작은 command/input boundary 뒤에 두어 Discord SDK type에 직접 의존하지 않게 한다. | P0 |
| CORE-003 | 성공, 검증 실패, 권한 실패, duplicate request, internal error 응답을 표준화한다. | P0 |
| CORE-004 | Secret은 environment variable 또는 secret storage에만 둔다. | P0 |
| CORE-005 | 외부 credential이 없는 test를 위해 fake/local integration boundary를 제공한다. | P1 |
| CORE-006 | 구현 시작 시 validation, routing, duplicate interaction handling, response formatting test를 추가한다. | P0 |

## 인수 조건

1. MVP command inventory가 SNS upload, receipt/remittance history, todo/schedule management를 포함한다.
2. Domain별로 구현 확정 항목과 결정 필요 항목이 분리되어 있다.
3. Discord slash command, modal/form, attachment 제약이 문서화되어 있다.
4. 미결정 사항이 follow-up issue로 바꿀 수 있을 만큼 명확하다.
5. 이 문서 자체만으로 구현 작업을 요구하지 않는다.
