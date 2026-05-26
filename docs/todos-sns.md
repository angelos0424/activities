# TODO: `sns-manager` 서비스

관련 PRD: `docs/prd-sns.md`

목표: `#sns`에서 Discord 기반 `sns-manager` product slice를 만든다.

## 사용자 조사

- [x] 홈페이지 업로드 target을 확인한다.
  - 확인일: 2026-05-26
  - 사용자 확인 결과: 홈페이지 builder/CMS는 Creatorlink(`https://creatorlink.net/`)이다.
  - 홈페이지 URL 자체는 bot flow 설계에 필요하지 않다. Bot server에 특정 호스팅/admin flow 기준 자동화 스크립트를 추가할 예정이며, 해당 flow에 맞춘 URL/path/selector 하드코딩은 허용한다.
  - API 연동은 필수 전제가 아니다. Selenium/Playwright 같은 browser automation으로 Creatorlink admin flow를 실행해 notice/gallery 포스팅까지 완료하는 것이 목표다.
  - 완료 후 bot은 생성된 포스팅 주소를 추출해 사용자에게 보여준다.
  - 다음 확인 필요: Creatorlink 로그인/세션 보관 방식, notice/gallery admin route, publish 버튼/상태 selector, 파일 업로드 selector, 게시 후 public URL 추출 방식.
  - 출처: GitHub issue #120 사용자 확인, `docs/prd-sns.md`

- [x] Meta account 가능성을 확인한다.
  - 확인일: 2026-05-26
  - Instagram 계정: `https://www.instagram.com/prokyouth`, Business account로 사용자 확인됨.
  - Facebook Page: `https://www.facebook.com/prokyouth/`, Page로 사용자 확인됨.
  - Instagram과 Facebook Page는 연결되어 있는 것으로 사용자 확인됨. 구현 전 Graph API로 Page의 linked Instagram professional account id를 조회해 재확인한다.
  - Meta Developer App/App Review 진행 가능: Page/Instagram 관리 권한이 있는 Facebook 계정으로 app 생성과 테스트가 가능하고, App Review까지 진행할 의사가 있는 것으로 사용자 확인됨.
  - 비용 판단: 검토한 Meta publishing 문서는 per-call API 이용료보다 access token, 권한, app review, rate limit을 핵심 제약으로 둔다. 별도 유료 API 전제가 없어 비용 때문에 MVP에서 제외하지 않는다.
  - 필요한 Instagram 권한: Facebook Login path 기준 `instagram_basic`, `instagram_content_publish`, `pages_read_engagement`; Instagram Login path 기준 `instagram_business_basic`, `instagram_business_content_publish`.
  - 필요한 Facebook Page 권한: `pages_manage_posts`, `pages_read_engagement`; 사진/동영상 publish에는 media endpoint와 추가 권한/제약을 구현 시 확인한다.
  - 판정: Instagram/Facebook 자동 업로드는 MVP 후보에 포함한다. 단, App Review/Advanced Access 승인 전에는 production 자동 게시를 켜지 않고 해당 target을 `skipped`로 기록한다. Manual upload packet fallback은 MVP에서 만들지 않는다.
  - 출처: GitHub issue #121 사용자 확인, Meta Instagram Content Publishing docs, Meta Pages API Posts docs.

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
  - Target `skipped`는 parent `sns_posts.status`에 새 enum을 추가하지 않고 terminal no-upload 상태로 집계한다. 모든 target이 자동 게시 `success`이면 parent `success`, 하나 이상 `success`이고 나머지가 `failed` 또는 `skipped`이면 parent `partial_success`, 모든 선택 target이 `failed` 또는 `skipped`이면 parent `failed`다.
  - 출처: `docs/data-schema.md`, `docs/prd-sns.md`, `docs/discord-command-spec.md`

## 엔지니어링 계획

- [x] Persistence를 결정한다.
  - Database table
  - Google Sheet log
  - Hybrid: DB source of truth + Sheet export
  - 초기 MVP 결정: bot state와 SNS request tracking은 SQLite.

- [x] Upload adapter 범위를 결정한다.
  - Homepage adapter는 Creatorlink admin browser automation으로 notice/gallery를 자동 포스팅한다.
  - 성공 시 생성된 포스팅 URL을 target result URL로 반환한다.
  - Creatorlink 자동화가 실패하면 해당 homepage target만 실패 처리하고 안전한 실패 메시지와 재시도 action을 반환한다.
  - Instagram/Facebook 자동 업로드는 Meta account 연결, access token, App Review/Advanced Access, publishing permission이 준비된 경우에만 켠다.
  - Meta API access가 없는 Instagram/Facebook channel은 MVP에서 업로드하지 않는다. Manual upload packet도 만들지 않고 target을 `skipped`로 기록해 "API access 미준비로 자동 업로드 제외"를 사용자에게 보여준다.
  - Target별 정책: Homepage는 자동 업로드만 지원하고 실패 시 `failed`; Instagram/Facebook은 권한 준비 시 자동 업로드, 권한 미준비 시 `skipped`; manual fallback은 MVP 범위에서 제외한다.
  - 출처: GitHub issue #120, GitHub issue #121, GitHub issue #123.

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
