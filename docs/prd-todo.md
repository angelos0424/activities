# PRD: `todo-manager` 서비스

Source:
- `docs/todo_domain_transcript.md`
- `/home/twkim/wikis/jisu/queries/2026-05-22-todo-domain-interview-summary.md`

Status: active domain PRD for Discord-first Activities MVP.

## 1. 요약

`todo-manager`는 Discord `#todo` 채널에서 개인/사무국/공동 작업 TODO를 생성, 조회, 지연, 상태 변경, 알림 처리하는 서비스다.

초기 방향은 완전한 캘린더 대체가 아니다. 사용자가 이미 겪는 핵심 문제인 `잊어버림`, `지난 일정 수동 지연`, `업무 배분`, `공동 작업 가시성`, `알림 위치 분리`를 먼저 해결한다.

## 2. 문제 정의

1. TODO를 만들어도 잊어버린다.
2. 오늘 못 한 일이나 지난 일정을 사용자가 직접 하나씩 미뤄야 한다.
3. Google Sheet 링크 공유로 업무를 배분하면 구성원이 확인하기 번거롭다.
4. 개인 작업, 사무국 작업, 공동 작업, 전체 공유 작업이 섞여 보인다.
5. 알림이 개인/사무국/전체 범위에 맞게 분리되지 않으면 피로도가 커진다.
6. Discord 명령이 너무 복잡하면 Google Calendar/Tasks/Sheets보다 불편해질 수 있다.

## 3. 목표

1. Discord `#todo`에서 TODO를 생성, 조회, 상태 변경한다.
2. 미완료 TODO를 `내일`, `3일 뒤`, `직접 지정 날짜`로 반자동 지연 처리한다.
3. 담당자, 공동 작업자, 확인자, 요청자 역할을 기록하되 MVP는 담당자를 중심으로 시작한다.
4. 개인/사무국/공동/전체 작업 범위를 구분한다.
5. 공개 범위에 따라 개인 DM, 사무국 채널, 전체 채널로 알림을 분리한다.
6. Google Sheets/Tasks/Calendar 연동 가능성을 열어두되 첫 구현은 Discord command 계약과 테스트 가능한 저장소 경계부터 검증한다.

## 4. MVP에서 하지 않는 것

1. 기존 Google Calendar 또는 KakaoTalk Calendar 전체 대체.
2. 완전 자동 지연 처리.
3. 복잡한 프로젝트 관리 도구.
4. 조직 전체 권한 시스템.
5. 반복 일정 고급 규칙.
6. 초기 버전에서 완전한 캘린더 UI 제공.
7. 초기 버전에서 Naver Directions API 기반 이동 시간 계산.
8. LLM/음성 입력을 필수 경로로 강제.

## 5. 사용자

| 사용자 | 필요 |
| --- | --- |
| 총무/운영 담당자 | TODO를 만들고 담당자를 배분하며 지연/진행 상태를 확인한다. |
| 담당자 | 본인이 맡은 TODO와 마감/알림을 확인하고 상태를 업데이트한다. |
| 공동 작업자/확인자 | 공동 작업의 진행도와 본인 역할을 확인한다. |
| 참여자 | 전체 공유 일정/TODO 알림을 필요한 범위에서 받는다. |
| 관리자 | 지연, 미완료, 완료 상태를 확인한다. |

## 6. 핵심 Entity

### 6.1 Todo Item

| 필드 | 필수 | 메모 |
| --- | --- | --- |
| id | yes | 내부 id |
| title | yes | TODO 제목 |
| description | no | 상세 설명 |
| status | yes | wait, progress, done, dismiss |
| due_at | no | 마감 또는 알림 기준 시간 |
| delayed_until | no | 반자동 지연 후 새 기준일 |
| category | no | personal, office, shared, all 등 |
| visibility | yes | private, office, shared, public |
| requester_id | no | 요청자. 확장 필드 |
| assignee_id | yes | 담당자. MVP 핵심 필드 |
| collaborators | no | 공동 작업자 목록 |
| reviewer_id | no | 확인자. 확장 필드 |
| source_discord_message_id | no | 원본 Discord message id |
| result_note | no | 결과 메모 |
| result_link | no | 결과 링크 |
| attachment_url | no | 첨부 파일 |
| created_by | yes | 생성자 |
| created_at | yes | timestamp |
| updated_at | yes | timestamp |

### 6.2 Reminder Rule

| 필드 | 필수 | 메모 |
| --- | --- | --- |
| todo_id | yes | 연결 TODO |
| target_scope | yes | private_dm, office_channel, public_channel |
| target_discord_id | yes | DM user id 또는 channel id |
| remind_at | yes | 알림 시간 |
| status | yes | pending, sent, cancelled |

## 7. 사용자 Flow

### 7.1 TODO 생성

1. 사용자가 `#todo`에서 `/todo add`를 입력한다.
2. Bot이 제목, 설명, 마감일, 담당자, 공개 범위를 받는다.
3. 선택 값으로 공동 작업자, 확인자, 요청자, 결과 링크/첨부를 받는다.
4. 기본 상태는 `wait`로 저장된다.
5. Bot이 생성 요약과 다음 행동을 응답한다.

### 7.2 TODO 목록 확인

1. 사용자가 `/todo list`를 입력한다.
2. Bot이 오늘/미완료/본인 담당 TODO를 우선 정렬한다.
3. 사용자는 필터로 담당자, 공개 범위, 상태, 지연 여부를 볼 수 있다.
4. 긴 목록은 page 또는 요약 + 상세 조회로 나눈다.

### 7.3 상태 변경

1. 사용자가 `/todo status` 또는 버튼으로 상태를 변경한다.
2. 상태 값은 `wait`, `progress`, `done`, `dismiss` 중 하나다.
3. 완료 시 결과 메모/link/file을 남길 수 있다.
4. `done`과 `dismiss`는 active 목록 아래로 내려간다.

### 7.4 지연 처리

1. 사용자가 `/todo delay` 또는 목록 버튼으로 미완료 TODO를 선택한다.
2. Bot이 `내일`, `3일 뒤`, `직접 지정 날짜` 후보를 제공한다.
3. 사용자가 선택하면 `delayed_until`과 `due_at`을 갱신한다.
4. 반복 지연된 TODO는 목록에서 표시한다.

### 7.5 알림

1. TODO의 공개 범위와 권한을 기준으로 알림 위치를 결정한다.
2. 개인 TODO는 개인 DM으로 알린다.
3. 사무국 TODO는 사무국 채널로 알린다.
4. 전체 공유 TODO는 전체 채널로 알린다.

## 8. 기능 요구사항

| ID | 요구사항 | 우선순위 |
| --- | --- | --- |
| TODO-001 | `#todo`에서 `/todo add`를 제공한다. | P0 |
| TODO-002 | `#todo`에서 `/todo list`를 제공한다. | P0 |
| TODO-003 | `/todo status` 또는 버튼으로 상태 변경을 제공한다. | P0 |
| TODO-004 | `/todo delay`로 반자동 지연 처리를 제공한다. | P0 |
| TODO-005 | 담당자 필드를 필수로 저장한다. | P0 |
| TODO-006 | 공동 작업자, 확인자, 요청자를 선택 필드로 저장할 수 있다. | P1 |
| TODO-007 | 개인/사무국/공동/전체 공개 범위를 구분한다. | P0 |
| TODO-008 | 공개 범위별 알림 위치를 분리한다. | P0 |
| TODO-009 | 반복 지연된 TODO를 목록에서 드러낸다. | P1 |
| TODO-010 | Google Sheets 연동을 위한 저장소 boundary를 둔다. | P1 |
| TODO-011 | 자연어/음성 입력을 후속 확장으로 검토한다. | P2 |

## 9. 정렬 요구사항

초기 목록 정렬:

1. 오늘 마감 또는 오늘 알림 TODO 먼저.
2. 상태가 `wait` 또는 `progress`인 TODO 먼저.
3. 담당자가 본인인 TODO 먼저.
4. 지연된 TODO는 별도 표시.
5. `done`과 `dismiss`는 active work 아래로 내림.
6. 같은 날짜 안에서는 due time 순.

## 10. 알림 정책

| 공개 범위 | 기본 알림 위치 |
| --- | --- |
| private | 개인 DM |
| office | 사무국 채널 |
| shared | 관련 담당자/공동 작업자 DM 또는 지정 thread |
| public | 전체 채널 |

MVP에서는 알림 위치를 설정으로 고정하고, 복잡한 권한 정책은 후속 작업으로 둔다.

## 11. Google Workspace/LLM 연동 방향

1. Google Sheets는 운영자가 보기 쉬운 TODO 표 또는 prototype 저장소 후보로 유지한다.
2. Google Tasks/Calendar 양방향 동기화는 MVP 이후 검토한다.
3. LLM/음성 입력은 Discord 텍스트 UX를 보완할 수 있지만 저장 전 확인 단계가 필요하다.
4. Provider 선택은 비용, Google Workspace 제어 가능성, 범용성, 환각 위험을 비교해 결정한다.

## 12. 인수 조건

1. 사용자는 `#todo`에서 TODO를 생성할 수 있다.
2. 사용자는 본인 또는 지정 범위의 미완료 TODO 목록을 볼 수 있다.
3. 사용자는 TODO 상태를 `wait`, `progress`, `done`, `dismiss`로 변경할 수 있다.
4. 사용자는 미완료 TODO를 내일/며칠 뒤/지정 날짜로 미룰 수 있다.
5. TODO에는 담당자가 필수로 저장된다.
6. 개인/사무국/공동/전체 범위가 저장되고 응답에 표시된다.
7. 알림은 공개 범위에 따라 DM/사무국 채널/전체 채널로 분리된다.
8. 외부 provider 없이도 fake/local storage로 테스트할 수 있다.

## 13. 위험

1. Discord 입력이 길어지면 기존 Google 도구보다 불편해질 수 있다.
2. 자동 지연은 사용자 의도와 다르게 TODO를 숨길 수 있다.
3. 권한/공개 범위를 과하게 만들면 MVP가 무거워진다.
4. Google Workspace 연동을 먼저 만들면 요구사항 변경 비용이 커진다.
5. LLM을 필수 경로로 두면 비용과 환각 위험이 커진다.

## 14. 미결정 사항

1. 첫 저장소는 Google Sheets, PostgreSQL, local/fake storage 중 무엇인가?
2. `/todo add`는 slash option 중심인가, modal 중심인가?
3. `shared` 범위의 알림은 DM 묶음, thread, 채널 중 어디로 보낼 것인가?
4. 지연 횟수 표시 기준은 몇 회부터인가?
5. Google Tasks/Calendar 동기화는 단방향인가, 양방향인가?
6. 자연어/음성 입력은 언제 MVP 후보로 승격할 것인가?

## 15. 참고

- 전사 정리: `docs/todo_domain_transcript.md`
- Discord command spec: `docs/discord-command-spec.md`
- 실행 TODO: `docs/todos-todo.md`
