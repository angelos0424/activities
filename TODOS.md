# Activities TODO Index

Source: service PRDs and shared planning docs.

Activities TODO는 PRD와 같은 구조로 관리한다. 루트 `TODOS.md`는 전체 인덱스와
현재 우선순위만 담당하고, 실제 실행 항목은 서비스별 TODO 문서와 `Roadmap.md`에
둔다.

## Current MVP Source of Truth

The active MVP is a local Discord bot operated through slash commands in
configured Discord channels.

The earlier web app, OCR-first receipt flow, meeting transcript analysis, and
browser report screens are deferred and must not be picked up as active work
unless a future issue explicitly moves them back into scope.

## Service TODOs

| Service | PRD | TODO |
| --- | --- | --- |
| SNS 업로드 | `docs/prd-sns.md` | `docs/todos-sns.md` |
| 영수증 | `docs/prd-receipts.md` | `docs/todos-receipts.md` |
| Todo | `docs/prd-todo.md` | `docs/todos-todo.md` |

## Shared Planning

| Document | Purpose |
| --- | --- |
| `Roadmap.md` | Overall implementation order. |
| `docs/requirements/discord-bot-mvp.md` | Discord bot MVP requirements and constraints. |
| `docs/discord-command-spec.md` | Discord command contract. |
| `docs/data-schema.md` | Shared data schema. |
| `docs/tech-stack.md` | Local bot stack decisions. |

## Priority

1. Shared local bot foundation.
2. 영수증: local Discord bot implementation after Google Sheets shape is confirmed.
3. SNS 업로드: `/post` input and result tracking.
4. Todo: Discord-based schedule flow in `#todo`, with discovery before broad implementation.

## Cross-Service TODOs

- [ ] Confirm exact Google Sheets column headers with the real sheets.
- [ ] Confirm Discord channel ids and admin role id.
- [ ] Run engineering review after SNS feasibility is decided.
- [x] Keep `docs/prd.md` as index only.
- [x] Keep `TODOS.md` as index only.
- [x] Document the shared Discord bot command namespace before implementation.
- [x] Document the shared MVP data schema.
- [x] Add Roadmap for cross-service implementation order.
- [ ] Do not reintroduce the old 회계/회의록 all-in-one PRD without an explicit decision.
