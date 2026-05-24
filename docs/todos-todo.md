# TODO: `todo-manager` 서비스

관련 PRD: `docs/prd-todo.md`
관련 인터뷰 정리: `docs/todo_domain_transcript.md`

목표: `#todo`에서 Discord 기반 `todo-manager` flow를 정의하고 검증한다.

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

- [ ] 1. Write the Todo command contract.
  - Scope:
    - Define `/todo add` with required assignee and visibility, optional due date,
      optional collaborators, optional reviewer, and optional requester.
    - Define `/todo list` with status, assignee, visibility, and delayed filters.
    - Define `/todo status` with `wait`, `progress`, `done`, and `dismiss`.
    - Define `/todo delay` with `내일`, `3일 뒤`, and direct date selection.
    - Specify success responses, validation failures, permission failures,
      empty-list text, and unknown todo behavior for each command.
    - Use stable, human-friendly task IDs such as `#1` for user-facing command
      input instead of UUIDs or Discord Snowflakes.
    - Define `/todo list` default ordering as today/incomplete/own assignments
      first, then due date ascending, null due dates last, then creation time
      ascending.
  - Candidate output files:
    - `docs/discord-command-spec.md`
    - `sns/src/domains/todo/README.md`
    - or a code-adjacent command contract file under the bot service.
  - Completion criteria:
    - Each command has inputs, normalized handler request shape, output message
      examples, and failure cases.
    - The contract states that Discord core channel enforcement runs before Todo
      handlers.
    - The contract names MVP-supported statuses and delayed-state behavior.
  - Validation:
    - Markdown review confirms add/list/status/delay are specified without
      relying on unresolved storage or language policy decisions.
    - Future implementation issues can copy one command section as their scope
      without needing additional discovery.

- [ ] 2. Implement Todo input validation.
  - Scope:
    - Validate `title` is present after trimming whitespace.
    - Enforce the maximum title length chosen in the command contract.
    - Parse required assignee and visibility values.
    - Trim optional description/result note values and enforce the contract's
      maximum lengths.
    - Parse optional due dates and delay target dates; reject unsupported formats.
    - Parse optional collaborators, reviewer, and requester Discord user values
      without requiring a separate identity mapping system.
    - Validate status/delay commands reject missing or malformed human-friendly
      IDs.
  - Candidate output files:
    - `sns/src/domains/todo/.../TodoCommandValidator.*`
    - `sns/src/domains/todo/.../TodoCommandValidatorTest.*`
    - or equivalent files in the selected bot service structure.
  - Completion criteria:
    - Validation returns structured success or failure results, not raw strings.
    - Failure results include stable error codes plus user-facing message keys or
      message text.
    - Invalid input never reaches storage or mutating handler logic.
  - Validation:
    - Unit tests cover missing title, blank title, maximum length boundary,
      over-limit title, missing assignee, invalid visibility, valid due date,
      invalid due date, valid collaborators/reviewer/requester, missing status
      ID, malformed status ID, and invalid delay target.
    - Tests assert both the validation status and the user-visible failure
      content expected by the command contract.

- [ ] 3. Define the Todo record shape.
  - Scope:
    - Define fields: `id`, `title`, `description`, `status`, `due_at`,
      `delayed_until`, `visibility`, `assignee_id`, `collaborators`,
      `reviewer_id`, `requester_id`, `source_discord_message_id`, `result_note`,
      `result_link`, `attachment_url`, `created_at`, `updated_at`, and
      `completed_at`.
    - Define allowed MVP status transitions for `wait`, `progress`, `done`, and
      `dismiss`.
    - Define whether timestamps are UTC instants or date-only fields.
    - Keep persistence annotations out until the permanent storage decision is
      made.
  - Candidate output files:
    - `sns/src/domains/todo/.../TodoRecord.*`
    - `sns/src/domains/todo/.../TodoStatus.*`
    - `sns/src/domains/todo/.../TodoRecordTest.*`
    - or equivalent files in the selected bot service structure.
  - Completion criteria:
    - The record shape is independent from Discord SDK objects.
    - The record can represent tasks created by `/todo add`, returned by
      `/todo list`, updated by `/todo status`, and delayed by `/todo delay`.
    - Completion sets `completed_at`; non-completed states leave it empty.
  - Validation:
    - Unit tests cover record construction, default status, optional fields,
      timestamp assignment, status transitions, delay state, and completed time.
    - Static review confirms no permanent storage dependency leaks into the
      record shape.

- [ ] 4. Implement Todo handlers with fake/local storage.
  - Scope:
    - Create a small storage boundary for add, list, find-by-id, status update,
      and delay update.
    - Implement fake/local storage for tests and scaffold development.
    - Implement add, list, status, and delay handlers against the storage
      boundary.
    - Keep fake storage explicitly non-production and resettable between tests.
  - Candidate output files:
    - `sns/src/domains/todo/.../TodoStorage.*`
    - `sns/src/domains/todo/.../InMemoryTodoStorage.*`
    - `sns/src/domains/todo/.../TodoCommandHandler.*`
    - `sns/src/domains/todo/.../TodoCommandHandlerTest.*`
    - or equivalent files in the selected bot service structure.
  - Completion criteria:
    - `/todo add` stores a normalized `TodoRecord` and returns the created
      summary.
    - `/todo list` returns empty-state output and filtered open/done/delayed
      results with the contract ordering.
    - `/todo status` updates an existing item or returns a clear not-found
      failure.
    - `/todo delay` records the selected delay target and exposes repeat-delay
      count or equivalent audit data.
    - Handler code depends on the storage boundary, not on a concrete permanent
      database or sheet client.
  - Validation:
    - Unit tests use fake/local storage and do not require external credentials.
    - Tests cover add success, list empty, list with items, list filtering,
      status change, delay success, unknown ID, and validation failure
      passthrough.

- [ ] 5. Add command-boundary tests.
  - Scope:
    - Test the Discord command adapter that maps slash command input into Todo
      handler requests.
    - Verify command responses match the Todo command contract.
    - Reuse Discord bot core fakes for requester, channel, and message IDs.
  - Completion criteria:
    - Command-boundary tests cover add, list, status, and delay success paths.
    - Permission/channel enforcement remains outside Todo handler logic.
  - Validation:
    - Tests pass without Discord, Google, database, or LLM provider credentials.

- [ ] 6. Decide and extend permanent storage.
  - Scope:
    - Choose Google Sheet-backed prototype, PostgreSQL, or another store.
    - Extend the storage interface only after fake/local handler behavior is
      locked by tests.
  - Validation:
    - Storage implementation has contract tests shared with fake/local storage.

- [ ] Google Tasks/Calendar 연동은 MVP 이후 issue로 분리한다.

- [ ] LLM/음성 입력은 저장 전 확인 UX가 정해진 뒤 issue로 분리한다.

## 검증

- [ ] `docs/prd-todo.md`와 `docs/todo_domain_transcript.md`가 서로 모순되지 않는지 리뷰한다.
- [ ] `docs/discord-command-spec.md`의 `/todo` section을 PRD에 맞춰 갱신한다.
- [ ] `docs/data-schema.md`의 Todo schema를 PRD 필드와 맞춘다.
- [ ] command handler test가 외부 provider 없이 통과한다.
- [ ] `#todo`에 실제 TODO 3개를 입력해 일이 줄어드는지 확인한다.
