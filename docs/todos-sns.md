# TODO: `sns-manager` 서비스

관련 PRD: `docs/prd-sns.md`

목표: `#sns`에서 Discord 기반 `sns-manager` product slice를 만든다.

## 사용자 조사

- [x] 홈페이지 업로드 target을 확인한다.
  - 확인일: 2026-05-26
  - 확인 결과: 현재 repository 문서/코드에는 실제 홈페이지 URL, CMS 종류, admin flow, notice/gallery API endpoint, 인증 방식이 없다.
  - `docs/data-schema.md`의 `sns-manager.homepage_target`은 placeholder이고, `sns/.env.example`에도 homepage adapter 설정값이 없다.
  - 현재 `sns-manager` runtime은 `/post` command boundary와 domain routing만 제공하며 homepage upload adapter 구현은 없다.
  - 판정: API로 notice/gallery를 자동 생성할 수 있는지 확인 불가. 자동 업로드는 보류하고 manual upload packet fallback이 필요하다.
  - 다음 확인 필요: 홈페이지 URL/admin URL, CMS/vendor, 관리자 권한, API 문서 또는 webhook 지원 여부, notice/gallery content model, 파일 업로드 제한, draft/publish 권한.
  - 출처: `docs/prd-sns.md`, `docs/data-schema.md`, `sns/.env.example`, `sns/src/domains/sns/post.ts`

- [ ] Meta account 가능성을 확인한다.
  - Instagram이 professional/business account인가?
  - Facebook이 Page인가?
  - 이 팀에게 app review와 publishing permission이 현실적인가?

- [x] Discord file input pattern을 결정한다.
  - 결정: `discord.js >= 14.24.0` 기준 Discord modal file upload를 `/post`의 1차 파일 입력 방식으로 사용한다.
  - Flow: `/post`가 target/homepage_type을 먼저 받은 뒤, 선택 결과에 따라 file upload modal의 `min_values`/`max_values`를 설정한다.
  - 대체: SDK/runtime 또는 Discord client 호환성 문제가 있으면 `/post`가 non-ephemeral 안내 메시지나 public thread를 열고, 같은 user/channel/thread의 attachment를 `제출 완료` 또는 timeout까지 수집한다.
  - 검증: JPEG/PNG 이미지 또는 MP4만 허용, 최대 10개, 제출 후 CDN download 단계에서 content type/size를 검증한다.
  - 출처: `docs/discord-command-spec.md`

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

- [x] Upload adapter 범위를 결정한다.
  - Homepage adapter는 자동 업로드 가능 여부가 확인될 때까지 `manual_required`를 반환하고, `sns_posts`와 `sns_post_assets` 데이터를 조합해 title/content/assets/homepage_type 기반 수동 업로드 패킷을 런타임에 만든다.
  - Homepage 자동 업로드는 target config와 API/admin flow가 확인된 뒤 별도 adapter로 연결한다.
  - Instagram/Facebook 자동 업로드는 account/API permission이 준비된 경우에만.
  - API access가 없는 channel은 manual upload packet fallback.
  - 출처: GitHub issue #120.

- [x] 실패 동작을 정의한다.
  - 제출 전 validation failure는 전체 요청을 중단하고 수정 안내를 반환한다.
  - 업로드 시작 후에는 한 target 실패가 이미 성공한 target을 막지 않는다.
  - 실패 channel은 독립적으로 재시도할 수 있다.
  - 사용자-facing error는 secret이나 provider raw response를 노출하지 않는다.
  - 출처: `docs/discord-command-spec.md`

## 검증

- [x] Discord bot server/runtime skeleton을 구현한다.
  - `sns` service-local Node/TypeScript runtime 추가.
  - `/post` command 등록/sync entrypoint 추가.
  - `DISCORD_SNS_CHANNEL_IDS` 기반 `#sns` channel allowlist guard 추가.
  - secret 없이 실행 가능한 config/test path 추가.
  - 출처: GitHub issue #130.

- [ ] Test Discord server의 `#sns`에서 `/post`를 실행한다.
- [ ] title/content/channel selection을 제출한다.
- [ ] 여러 JPEG/PNG/MP4 attachment를 업로드한다.
- [ ] 채널별 결과가 반환되는지 확인한다.
- [ ] 모든 시도가 기록되는지 확인한다.
