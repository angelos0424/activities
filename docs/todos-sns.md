# TODO: SNS 업로드 서비스

관련 PRD: `docs/prd-sns.md`

목표: `#sns`에서 Discord 기반 SNS 업로드 product slice를 만든다.

## 사용자 조사

- [ ] 홈페이지 업로드 target을 확인한다.
  - 홈페이지는 어떤 CMS/API/admin flow를 쓰는가?
  - API로 notice/gallery를 만들 수 있는가?

- [ ] Meta account 가능성을 확인한다.
  - Instagram이 professional/business account인가?
  - Facebook이 Page인가?
  - 이 팀에게 app review와 publishing permission이 현실적인가?

- [ ] Discord file input pattern을 결정한다.
  - 선호: 선택한 SDK가 지원하면 Discord modal file upload.
  - 대체: `/post`가 flow를 열고 사용자가 attachment로 reply.

## 제품 설계

- [x] Command 계약을 설계한다.
  - `/post`
  - target channel: instagram, facebook, homepage
  - homepage type: notice, gallery
  - title/content
  - multiple image/mp4 files
  - 초기 확정 payload에는 generic `links` field를 넣지 않음.
  - Optional `audio` metadata는 provider 지원 여부에 따라 달라짐.
  - 출처: `docs/discord-command-spec.md`, local `SNS_POST_REQUIREMENTS.md` 반영.

- [x] 결과 추적 방식을 정의한다.
  - 채널별 status
  - 결과 URL
  - 실패 사유
  - 재시도 action
  - 출처: `docs/data-schema.md`

## 엔지니어링 계획

- [x] Persistence를 결정한다.
  - Database table
  - Google Sheet log
  - Hybrid: DB source of truth + Sheet export
  - 초기 MVP 결정: bot state와 SNS request tracking은 SQLite.

- [ ] Upload adapter 범위를 결정한다.
  - Homepage 자동 업로드 먼저.
  - Instagram/Facebook 자동 업로드는 account/API permission이 준비된 경우에만.
  - API access가 없는 channel은 manual upload packet fallback.

- [x] 실패 동작을 정의한다.
  - 제출 전 validation failure는 전체 요청을 중단하고 수정 안내를 반환한다.
  - 업로드 시작 후에는 한 target 실패가 이미 성공한 target을 막지 않는다.
  - 실패 channel은 독립적으로 재시도할 수 있다.
  - 사용자-facing error는 secret이나 provider raw response를 노출하지 않는다.
  - 출처: `docs/discord-command-spec.md`

## 검증

- [ ] Test Discord server의 `#sns`에서 `/post`를 실행한다.
- [ ] title/content/channel selection을 제출한다.
- [ ] 여러 image/mp4 attachment를 업로드한다.
- [ ] 채널별 결과가 반환되는지 확인한다.
- [ ] 모든 시도가 기록되는지 확인한다.
