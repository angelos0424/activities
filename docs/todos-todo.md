# TODO: Todo 및 일정 서비스

관련 PRD: `docs/prd-todo.md`

목표: `#todo`에서 Discord 기반 Todo flow를 정의하고 검증한다.

## 사용자 조사

- [ ] 현재 일정 사용자와 인터뷰한다.
  - 현재 도구: KakaoTalk Calendar, Google Calendar, Sheet 등.
  - 가장 큰 pain.
  - 누가 일정을 만들고, 수정하고, 확인하는가.

- [ ] 이동 시간이 실제로 중요한지 검증한다.
  - 같은 날 이동이 실제 문제인 빈도.
  - MVP에서 deep link만으로 충분한지.
  - Naver Directions API 구현 비용을 감수할 가치가 있는지.

- [ ] 실제 일정 실패 사례를 확인한다.
  - 놓친 회의.
  - 이동 시간 때문에 늦은 사례.
  - owner가 불명확한 사례.
  - 결과물이 누락된 사례.

## 제품 결정

- [ ] 초기 저장소를 결정한다.
  - DB-backed app.
  - Google Sheet-backed prototype.
  - Local bot config/file-backed prototype.

- [ ] 최소 field를 정의한다.
  - title
  - description
  - start time
  - estimated duration
  - location
  - related person/org
  - status
  - type
  - result note/link/file

- [ ] 목록 정렬을 결정한다.
  - 오늘 먼저.
  - upcoming time 먼저.
  - active status 먼저.
  - done/dismissed는 active work 아래.

- [x] Discord command 계약을 설계한다.
  - `/todo add`
  - `/todo list`
  - `/todo status`
  - done/dismiss는 `/todo status`의 status value로 처리.
  - 출처: `docs/discord-command-spec.md`.

## 엔지니어링 계획

- [ ] Todo가 영수증 서비스의 사람/단체 data를 공유할지 결정한다.
- [ ] Todo가 Discord-only로 시작할지, Discord + Sheet prototype으로 시작할지 결정한다.
- [ ] MVP 지도 integration이 deep link만으로 충분한지 결정한다.
- [ ] 이동 시간 pain이 검증되기 전까지 Naver Directions API는 보류한다.

## 검증

- [ ] 현재 일정 관리 방식을 1주 관찰한다.
- [ ] owner/status/result needs가 있는 실제 일정 item을 최소 3개 수집한다.
- [ ] `#todo`에 data를 입력하는 방식이 일을 줄이는지 늘리는지 확인한다.
