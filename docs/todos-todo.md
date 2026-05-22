# TODO: Todo and Schedule Service

Related PRD: `docs/prd-todo.md`

Goal: Define and validate the Discord-based Todo flow in `#todo`.

## Discovery

- [ ] Interview current schedule users.
  - Current tool: KakaoTalk Calendar, Google Calendar, Sheet, etc.
  - Biggest pain.
  - Who creates, updates, and consumes schedules.

- [ ] Validate whether travel time matters.
  - How often same-day movement is a real problem.
  - Whether deep links are enough for MVP.
  - Whether Naver Directions API is worth the implementation cost.

- [ ] Identify real schedule failure cases.
  - Missed meeting.
  - Late arrival due to travel time.
  - Unclear owner.
  - Missing result artifact.

## Product Decisions

- [ ] Decide initial storage.
  - DB-backed app.
  - Google Sheet-backed prototype.
  - Local bot config/file-backed prototype.

- [ ] Define minimum fields.
  - title
  - description
  - start time
  - estimated duration
  - location
  - related person/org
  - status
  - type
  - result note/link/file

- [ ] Decide list sorting.
  - Today first.
  - Upcoming time first.
  - Active statuses first.
  - Done/dismissed below active work.

- [x] Design Discord command contract.
  - `/todo add`
  - `/todo list`
  - `/todo status`
  - done/dismiss handled through `/todo status` status values.
  - Source: `docs/discord-command-spec.md`.

## Engineering Planning

- [ ] Decide whether Todo shares person/org data with Receipt service.
- [ ] Decide whether Todo starts as Discord-only or Discord + Sheet prototype.
- [ ] Decide whether map integration is deep link only for MVP.
- [ ] Defer Naver Directions API until travel-time pain is verified.

## Validation

- [ ] Observe one week of current schedule management.
- [ ] Capture at least three real schedule items with owner/status/result needs.
- [ ] Confirm whether entering data in `#todo` reduces or increases work.
