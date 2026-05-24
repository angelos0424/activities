# TODO: `todo-manager` 서비스

관련 PRD: `docs/prd-todo.md`
관련 인터뷰 정리: `docs/todo_domain_transcript.md`

목표: `#todo`에서 Discord 기반 `todo-manager` flow를 정의하고 검증한다.

## Document Paths and Source of Truth

- Current Todo TODO 기준 문서: `docs/todos-todo.md`.
- Compatibility path: root `TODOS.md` is retained as a pointer to service-specific
  TODO documents so older references do not create a second TODO source of truth.
- Decision: keep Todo execution tasks in `docs/todos-todo.md`; keep product
  requirements in `docs/prd-todo.md`.

## 사용자 조사

- [x] 현재 일정/TODO 사용 방식을 정리한다.
  - 개인 일정: Google Calendar, Google Tasks.
  - 사무국 문서: Google Docs, Google Sheets.
  - 전체 공유 일정: KakaoTalk Calendar.
  - TODO/업무 분담: Google Sheet 링크 공유.
  - 출처: `docs/todo_domain_transcript.md`.

- [x] 현재 방식에서 가장 큰 pain을 정리한다.
  - TODO를 만들어도 잊어버림.
  - 오늘 못 한 일이나 지난 일정을 직접 하나씩 미뤄야 함.
  - Google Sheet 링크 공유는 접근 장벽이 있음.
  - 개인/사무국/공동/전체 작업이 직관적으로 분리되지 않음.

- [x] TODO MVP의 우선 문제를 확정한다.
  - 지도/이동 시간보다 지연 처리, 업무 배분, 공동 작업 가시성, 알림 분리를 우선한다.

- [ ] 실제 TODO 실패 사례를 최소 3개 수집한다.
  - 놓친 업무.
  - 지연 처리가 누락된 업무.
  - 담당자/확인자가 불명확했던 업무.
  - 공동 작업 진행도가 보이지 않았던 업무.

## 제품 결정

- [x] MVP 핵심 flow를 정한다.
  - `/todo add`
  - `/todo list`
  - `/todo status`
  - `/todo delay`
  - 공개 범위별 알림.

- [x] 자동 지연 정책을 정한다.
  - 완전 자동 지연은 MVP에서 제외한다.
  - 사용자가 `내일`, `3일 뒤`, `직접 지정 날짜` 중 선택하는 반자동 지연으로 시작한다.

- [x] 역할 필드 우선순위를 정한다.
  - 담당자는 MVP 필수.
  - 공동 작업자, 확인자, 요청자는 선택/확장 필드.

- [x] 알림 위치 기본값을 정한다.
  - 개인 TODO: 개인 DM.
  - 사무국 TODO: 사무국 채널.
  - 전체 공유 TODO: 전체 채널.

- [ ] 초기 저장소를 결정한다.
  - Google Sheet-backed prototype.
  - PostgreSQL.
  - Local/fake storage for development.

- [ ] `shared` 범위의 알림 위치를 결정한다.
  - 관련자 DM.
  - 지정 thread.
  - 사무국 채널 thread.

- [ ] `/todo add` 입력 UX를 확정한다.
  - slash option 중심.
  - modal 중심.
  - slash option + modal 혼합.

## 엔지니어링 계획

- [ ] `todo-manager` record shape를 구현한다.
  - `id`, `title`, `description`, `status`, `due_at`, `delayed_until`.
  - `visibility`, `assignee_id`, `collaborators`, `reviewer_id`, `requester_id`.
  - `source_discord_message_id`, `result_note`, `result_link`, `attachment_url`.

- [ ] `/todo add` command contract를 갱신한다.
  - 담당자 필수.
  - 공개 범위 필수.
  - 마감일 optional.
  - 공동 작업자/확인자/요청자 optional.
  - 성공 응답에는 human-friendly id, task summary, 다음 행동 안내를 포함한다.
  - 실패 응답에는 validation failure text를 포함하고 저장소 write를 하지 않는다.

- [ ] `/todo list` command contract를 갱신한다.
  - 오늘/미완료/본인 담당 우선 정렬.
  - 상태, 담당자, 공개 범위, 지연 여부 filter.
  - active TODO 우선, 본인 담당 우선, `due_at` 오름차순, null due_at last,
    생성 시간 오름차순 규칙을 명시한다.
  - 긴 목록 pagination 또는 요약 + 상세 조회.
  - 결과가 없을 때는 오류가 아닌 empty-list 성공 응답을 반환한다.

- [ ] `/todo status` command contract를 갱신한다.
  - `wait`, `progress`, `done`, `dismiss`.
  - `/todo add`가 반환한 `#1` 같은 human-friendly id를 입력으로 사용한다.
  - 완료 시 결과 메모/link/file 확장 가능.
  - `done` 전환 시 `completed_at`을 설정한다.

- [ ] `/todo delay` command contract를 추가한다.
  - `내일`, `3일 뒤`, `직접 지정 날짜`.
  - 반복 지연 횟수 표시.

- [ ] 공개 범위별 reminder routing boundary를 만든다.
  - `private_dm`.
  - `office_channel`.
  - `public_channel`.

- [ ] fake/local storage로 todo handler test를 먼저 작성한다.
  - add success.
  - missing title.
  - missing assignee.
  - invalid due date.
  - delay success.
  - list sorting.
  - status change.

- [ ] Google Sheets 연동 여부를 결정한 뒤 storage interface를 확장한다.

- [ ] Google Tasks/Calendar 연동은 MVP 이후 issue로 분리한다.

- [ ] LLM/음성 입력은 저장 전 확인 UX가 정해진 뒤 issue로 분리한다.

## 검증

- [ ] `docs/prd-todo.md`와 `docs/todo_domain_transcript.md`가 서로 모순되지 않는지 리뷰한다.
- [ ] `docs/discord-command-spec.md`의 `/todo` section을 PRD에 맞춰 갱신한다.
- [ ] `docs/data-schema.md`의 Todo schema를 PRD 필드와 맞춘다.
- [ ] command handler test가 외부 provider 없이 통과한다.
- [ ] `#todo`에 실제 TODO 3개를 입력해 일이 줄어드는지 확인한다.
