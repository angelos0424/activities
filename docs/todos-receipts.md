# TODO: 영수증 서비스

관련 PRD: `docs/prd-receipts.md`

목표: 로컬 Discord bot + Google Sheets로 영수증 제출과 송금 상태를 관리한다.

## 로컬 Bot Setup

- [x] 로컬 bot 실행 환경을 정의한다.
  - Node.js + TypeScript.
  - `discord.js`.
  - Docker Compose.
  - 출처: `docs/tech-stack.md`.

- [ ] 로컬 영수증 저장 방식을 정의한다.
  - `data/receipts/{yyyy}/{MM}/{HHMMSS}/{fileid}`.
  - Bot이 생성한 fileid만 사용.
  - 최대 file size.
  - 출처: `docs/data-schema.md`.

- [ ] Sheet 설정 slash command를 추가한다.
  - `/receipt sheet status`
  - `/receipt sheet set people:<url> transfers:<url>`
  - Admin-only permission check.

## Spreadsheet 설계

- [x] People Sheet column을 정의한다.
  - person_id
  - type
  - name
  - contact
  - optional account
  - 출처: `docs/data-schema.md`.

- [x] Transfer Sheet column을 정의한다.
  - transfer_id
  - person_id
  - name
  - account
  - amount
  - status: 송금전, 완료, 보류
  - receipt_local_path
  - receipt_original_filename
  - receipt_mime_type
  - 출처: `docs/data-schema.md`.

## Discord Flow

- [x] Command 이름을 결정한다.
  - 권장: `/receipt add`, `/receipt check`.
  - `/check`처럼 service scope가 없는 receipt command는 피한다.
  - 출처: `docs/discord-command-spec.md`.

- [ ] 사람/단체 검색 응답을 설계한다.
  - 단일 exact match: confirmation 표시.
  - 여러 match: select menu 표시.
  - match 없음: 신규 사람/단체 form 열기.

- [ ] 영수증 이미지 수집 방식을 설계한다.
  - SDK가 지원하면 command attachment.
  - 지원하지 않으면 reply attachment fallback.
  - 업로드 이미지는 로컬 저장소에 저장.

## 제품 결정

- [ ] 금액 입력 방식을 결정한다.
  - 지금은 수동 입력.
  - OCR은 반복 사용이 실제로 검증된 뒤.

- [ ] 계좌 정보 privacy handling을 정의한다.
  - 누가 `/receipt check`를 실행할 수 있는가?
  - 누가 계좌번호를 볼 수 있는가?
  - Discord message에서 계좌번호를 masking해야 하는가?

- [ ] 로컬 파일 저장 오류 처리를 정의한다.
  - Storage directory missing.
  - Permission denied.
  - Duplicate upload.
  - Invalid file type.

- [x] SQLite local state를 정의한다.
  - Sheet URL.
  - Local file metadata.
  - Command audit log.
  - 출처: `docs/data-schema.md`.

## 검증

- [ ] Sheet에 알려진 사람/단체를 추가한다.
- [ ] `/receipt add`를 실행하고 matching 동작을 확인한다.
- [ ] Discord에서 신규 사람/단체를 추가한다.
- [ ] Transfer Sheet row가 `송금전`으로 시작하는지 확인한다.
- [ ] 영수증 이미지를 업로드하고 로컬에 저장되는지 확인한다.
- [ ] 로컬 경로가 Transfer Sheet에 기록되는지 확인한다.
- [ ] Slash command로 sheet URL을 변경하고 새 command가 이를 사용하는지 확인한다.
- [ ] Sheets에서 row를 `완료`로 수동 변경한다.
- [ ] `/receipt check`를 실행해 count가 업데이트되는지 확인한다.
