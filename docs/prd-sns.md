# PRD: `sns-manager` 서비스

## 1. 요약

`sns-manager` 서비스는 Discord `#sns` 채널에서 `/post` 명령어로 시작한다. 사용자는 form 형태로 업로드 채널, 홈페이지 분류, 제목, 내용, 이미지/영상 파일을 입력하고, bot은 준비된 adapter가 있는 Instagram, Facebook, 홈페이지에 업로드한다. API access가 없는 채널은 MVP에서 업로드하지 않고 skip 사유를 남긴다.

MVP의 핵심은 "여러 채널에 올라가야 하는 공지/갤러리 게시물이 누락되지 않게 하고, 결과 URL을 한곳에 남기는 것"이다.

## 2. 목표

1. 사용자가 Discord `#sns` 채널에서 `/post`로 `sns-manager` 작업을 시작한다.
2. 사용자가 업로드 채널을 선택한다: Instagram, Facebook, Homepage.
3. 홈페이지 업로드 시 공지/갤러리 중 하나를 선택한다.
4. 사용자가 title, content, 이미지/영상 파일을 제출한다.
5. 시스템이 업로드 결과 URL을 채널별로 반환한다.
6. 실패한 채널은 실패 사유와 재시도 방법을 보여준다.

## 3. MVP에서 하지 않는 것

1. 모든 SNS 플랫폼 지원.
2. KakaoTalk 자동 업로드.
3. 게시 예약 시스템.
4. 승인 workflow 전체 구현.
5. 복잡한 콘텐츠 편집기.
6. AI 문구 생성.
7. API access가 없는 채널의 manual upload packet 생성.

## 4. 사용자

| 사용자 | 필요 |
| --- | --- |
| SNS 담당자 | 같은 게시물을 여러 채널에 빠짐없이 올리고 결과 URL을 남긴다. |
| 총무/운영 담당자 | 업로드 누락 여부와 결과 링크를 확인한다. |
| 홈페이지 관리자 | 홈페이지 공지/갤러리 게시 위치를 구분해 업로드한다. |

## 5. 사용자 Flow

### 5.1 게시물 생성

1. 사용자가 Discord `#sns` 채널에서 `/post` 명령어를 입력한다.
2. Bot이 업로드 form/modal을 연다.
3. 사용자가 업로드 채널을 선택한다.
   - Instagram
   - Facebook
   - Homepage
4. Homepage가 선택된 경우 공지/갤러리를 선택한다.
5. 사용자가 title을 입력한다.
6. 사용자가 content를 입력한다.
7. 사용자가 이미지 또는 mp4 파일을 여러 개 첨부한다.
8. Bot이 입력을 검증한다.
9. Bot이 채널별 업로드를 실행한다. Homepage는 Creatorlink admin browser automation으로 notice/gallery 포스팅을 완료하고, API access가 없는 Instagram/Facebook target은 업로드하지 않고 `skipped`로 기록한다.
10. Bot이 결과 URL 또는 실패 사유를 반환한다.

### 5.2 결과 확인

1. Bot이 `#sns` 또는 생성된 thread에 채널별 상태를 표시한다.
2. 성공한 채널은 URL을 보여준다.
3. 실패한 채널은 재시도 버튼을 보여준다.
4. 전체 결과는 Google Sheets 또는 DB에 기록한다.

## 6. Discord UX 요구사항

| ID | 요구사항 | 우선순위 |
| --- | --- | --- |
| SNS-UX-001 | `#sns` 채널에서 `/post` 명령어를 제공한다. | P0 |
| SNS-UX-002 | 채널 선택은 checkbox 또는 multi-select 형태로 제공한다. | P0 |
| SNS-UX-003 | 홈페이지 선택 시 공지/갤러리 선택 UI를 제공한다. | P0 |
| SNS-UX-004 | title/content는 Discord modal/form으로 입력받는다. | P0 |
| SNS-UX-005 | 이미지/영상은 multiple upload를 지원한다. | P0 |
| SNS-UX-006 | 업로드 진행 중 상태를 Discord message로 표시한다. | P0 |
| SNS-UX-007 | 채널별 결과 URL을 반환한다. | P0 |

## 7. 플랫폼 가능성 메모

Discord slash command option으로 attachment를 받을 수 있고 modal은 text input과 select류 입력에 적합하다. Discord는 2025년에 modal file upload component를 추가했지만, 실제 라이브러리 지원과 운영 안정성은 구현 전에 확인해야 한다.

MVP 대체 flow:

1. `/post`로 title/content/channel/options를 받는다.
2. Bot이 "이 메시지에 이미지/영상 파일을 reply로 업로드하세요"라고 안내한다.
3. 사용자가 파일을 메시지 첨부로 올린다.
4. Bot이 해당 attachment를 수집해 업로드 작업을 진행한다.

### 7.1 Homepage target 조사 결과

확인일: 2026-05-26

사용자 확인 결과 홈페이지 builder/CMS는 Creatorlink(`https://creatorlink.net/`)이다. 홈페이지 URL 자체는 bot flow 설계에 필요하지 않다. Bot server에 특정 호스팅/admin flow 기준 자동화 스크립트를 추가할 예정이며, 해당 flow에 맞춘 URL/path/selector 하드코딩은 허용한다.

판정:

1. Homepage target은 Creatorlink admin browser automation으로 자동 포스팅한다.
2. API 연동은 필수 전제가 아니다. Selenium/Playwright 같은 browser automation으로 notice/gallery 작성, 파일 업로드, publish까지 처리한다.
3. 자동화가 성공하면 생성된 포스팅 주소를 추출해 target result URL로 반환한다.
4. 자동화 실패는 homepage target 실패로 기록하고, 이미 성공한 다른 target은 되돌리지 않는다.
5. 구현 전 확인할 세부 항목은 Creatorlink 로그인/세션 보관 방식, notice/gallery admin route, publish 버튼/상태 selector, 파일 업로드 selector, 게시 후 public URL 추출 방식이다.

### 7.2 Meta account/API 조사 결과

확인일: 2026-05-26

사용자 확인 결과 Instagram 계정은 `https://www.instagram.com/prokyouth`이고 Business account다. Facebook target은 개인 profile이 아니라 `https://www.facebook.com/prokyouth/` Page다. Instagram 계정은 해당 Facebook Page에 연결되어 있는 것으로 확인됐으며, 구현 전 Graph API로 Page의 linked Instagram professional account id를 조회해 재확인한다.

Meta Developer App과 App Review도 진행 범위에 포함한다. Page/Instagram 관리 권한이 있는 Facebook 계정으로 app 생성과 테스트가 가능하고, App Review까지 진행할 의사가 있는 것으로 확인됐다. 검토한 Meta publishing 문서는 per-call API 이용료보다 access token, 권한, app review, rate limit을 핵심 제약으로 둔다. 별도 유료 API 전제가 없어 비용 때문에 MVP에서 제외하지 않는다.

필요 조건:

1. Instagram publishing은 Professional account가 필요하다. Facebook Login path를 쓰면 linked Page의 Page access token과 `instagram_basic`, `instagram_content_publish`, `pages_read_engagement`가 필요하다.
2. Instagram Login path를 쓰면 `instagram_business_basic`, `instagram_business_content_publish`가 필요하다.
3. Facebook Page publishing은 Page access token과 `pages_manage_posts`, `pages_read_engagement`가 필요하다. Page user는 해당 Page에서 content creation 관련 task를 수행할 수 있어야 한다.
4. 사진/동영상 publish는 각 platform의 media endpoint, public media URL 또는 upload flow, media type 제한을 adapter 구현 시 검증한다.

판정:

1. Instagram/Facebook 자동 업로드는 MVP 후보에 포함한다.
2. Production 자동 게시 enable 조건은 Meta Developer App, access token 저장/갱신 정책, App Review/Advanced Access, publishing permission 승인이다.
3. 승인 전에는 Instagram/Facebook target을 업로드하지 않는다. Manual upload packet fallback은 만들지 않고, target을 `skipped`로 기록해 API access 미준비 사유를 반환한다.
4. App Review 제출에는 실제 `/post` flow에서 Meta Login, Page/Instagram 선택 또는 확인, 게시 실행, 결과 URL 반환까지 보여주는 테스트 path와 screencast가 필요하다.

MVP upload/fallback 정책:

1. Homepage는 Creatorlink admin browser automation으로 notice/gallery를 자동 포스팅한다.
2. Instagram/Facebook은 Meta API access, token, App Review/Advanced Access, publishing permission이 모두 준비된 target만 자동 포스팅한다.
3. API access가 없는 Instagram/Facebook target은 manual packet 없이 `skipped`로 종료한다.
4. `skipped` target은 결과 URL을 비워두고, 사용자에게 "API access 미준비로 자동 업로드 제외"를 보여준다.

## 8. Source 요구사항 메모

이 PRD는 PR #109 이전 작업 tree에 있던 local source note `SNS_POST_REQUIREMENTS.md`의 내용을 반영한다. 해당 note와 PR #109 문서 set이 충돌할 때는 PR #109를 organizing source of truth로 유지하고, note 내용은 implementation detail로 접어 넣는다.

확인된 `/post` source 요구사항:

1. 업로드 target을 선택한다: Instagram, Facebook, Homepage.
2. Homepage가 선택되면 Notice 또는 Gallery를 선택한다.
3. 가능하면 Discord modal/form UX로 `title`과 `content`를 입력한다.
4. 여러 이미지 파일 또는 mp4 영상을 업로드한다.
5. Target별 결과 URL을 반환한다.
6. 별도 확인된 요구사항이 생기기 전까지 generic `links` field는 제외한다.
7. Video/Reels planning을 위해 optional `audio` metadata를 허용하되, 실제 Meta music-library 지원은 미결정으로 둔다.

충돌 처리:

- Source note는 validation failure가 전체 요청을 중단해야 한다고 말하고, PR #109는 한 channel 실패가 다른 channel을 막지 않아야 한다고 말한다. 둘 다 phase별로 적용한다. 입력 검증 실패는 업로드 전에 전체 요청을 중단하고, 업로드가 시작된 뒤의 실패는 target별로 기록하며 성공 target은 성공으로 유지한다.
- Source note는 Homepage가 별도 DB를 추가하지 않아야 한다고 말한다. PR #109는 SQLite request/target tracking을 MVP source of truth로 둔다. Homepage adapter code는 future issue가 요구하기 전까지 homepage-specific database를 별도로 만들지 않는다.

## 9. 기능 요구사항

| ID | 요구사항 | 우선순위 |
| --- | --- | --- |
| SNS-FE-001 | Discord `/post` command schema를 정의한다. | P0 |
| SNS-FE-002 | Discord modal/form 입력을 처리한다. | P0 |
| SNS-FE-003 | 파일 첨부 수집 및 검증을 처리한다. | P0 |
| SNS-FE-004 | Homepage 업로드 adapter를 제공한다. Creatorlink admin browser automation으로 notice/gallery를 자동 포스팅하고 결과 URL을 반환한다. | P0 |
| SNS-FE-005 | Instagram upload adapter를 제공한다. App Review/Advanced Access 승인 전에는 업로드하지 않고 `skipped`로 기록한다. | P1 |
| SNS-FE-006 | Facebook upload adapter를 제공한다. App Review/Advanced Access 승인 전에는 업로드하지 않고 `skipped`로 기록한다. | P1 |
| SNS-FE-007 | 채널별 업로드 결과를 저장한다. | P0 |
| SNS-FE-008 | 실패한 채널만 재시도할 수 있다. | P1 |
| SNS-FE-009 | 제출 전 검증 실패는 전체 요청을 중단하고 수정 안내를 반환한다. | P0 |
| SNS-FE-010 | `links`는 향후 요구사항이 확정되기 전까지 initial payload에서 제외한다. | P1 |
| SNS-FE-011 | Video/Reels planning을 위해 optional `audio` metadata를 허용하되, provider 지원 여부는 별도 검증한다. | P2 |

## 10. 데이터 모델

### `sns_posts`

| 필드 | 타입 | 메모 |
| --- | --- | --- |
| id | uuid | 내부 id |
| discord_guild_id | string | Discord server id |
| discord_channel_id | string | `#sns` channel id |
| requested_by | string | Discord user id |
| title | text | 게시 제목 |
| content | text | 게시 본문 |
| homepage_type | enum | notice, gallery, none |
| status | enum | draft, processing, partial_success, success, failed |
| created_at | timestamp | 생성 시각 |
| updated_at | timestamp | 수정 시각 |

상위 `sns_posts.status` 집계 규칙:

1. `sns_posts.status`는 전체 요청 처리 상태이고, `skipped`는 parent status가 아니라 target status다.
2. Target 중 하나라도 `pending` 또는 `processing`이면 parent는 `processing`이다.
3. 선택된 모든 non-skipped target이 `success`이면 parent는 `success`다. 모든 선택 target이 `skipped`인 경우도 요청이 명세대로 처리된 것이므로 parent는 `success`다.
4. 모든 target 처리가 끝났고 하나 이상이 `success`이고 하나 이상이 `failed`이면 parent는 `partial_success`다. `skipped`는 성공/실패 집계에서 제외한다.
5. 모든 선택 non-skipped target이 `failed`이거나 제출 전 validation failure로 target work가 시작되지 못하면 parent는 `failed`다.

### `sns_post_targets`

| 필드 | 타입 | 메모 |
| --- | --- | --- |
| id | uuid | 내부 id |
| post_id | uuid | parent post |
| target | enum | instagram, facebook, homepage |
| status | enum | pending, processing, success, failed, skipped |
| result_url | text | 결과 URL. 자동 포스팅 성공 시 생성된 게시물 URL. `skipped`이면 비워둔다. |
| error_message | text | 사용자에게 보여줄 수 있는 오류 |
| retry_count | integer | 재시도 횟수 |

### `sns_post_assets`

| 필드 | 타입 | 메모 |
| --- | --- | --- |
| id | uuid | 내부 id |
| post_id | uuid | parent post |
| source_attachment_url | text | Discord attachment CDN URL. 만료될 수 있으므로 audit/debug metadata로만 사용 |
| mime_type | text | 이미지 또는 영상 |
| size_bytes | bigint | 파일 크기 |
| storage_url | text | provider upload에 사용할 durable copy |

Discord attachment CDN URL은 일정 시간 뒤 접근이 만료될 수 있으므로 `source_attachment_url`은 장기 provider upload 입력으로 사용하지 않는다. Bot은 modal submit 또는 attachment 수집 직후 파일을 local storage 또는 향후 durable storage adapter에 복사하고, provider upload에는 `storage_url`을 사용한다. MVP는 manual upload packet을 만들지 않는다.

## 11. 검증 규칙

1. Title은 필수다.
2. Content는 필수다.
3. 하나 이상의 target channel이 필요하다.
4. Homepage target은 homepage_type이 필요하다.
5. Asset은 image 또는 mp4여야 한다.
6. 여러 asset을 허용하되, 각 platform adapter가 자체 제한을 둘 수 있다.
7. Platform upload가 설정되지 않았으면 조용히 실패하지 말고 해당 target을 `skipped`로 기록한 뒤 "API access 미준비로 자동 업로드 제외"를 반환한다.
8. 제출 전 검증 실패는 전체 요청을 중단하고 수정 안내를 반환한다.
9. Runtime upload failure는 validation이 성공한 뒤 target별로 기록한다.
10. Initial payload에는 `links`를 포함하지 않는다.
11. `audio`는 optional이며 video/Reels flow에서 필요할 때만 사용한다.
12. Manual upload packet은 MVP 범위에서 만들지 않는다.

## 12. 인수 조건

1. `/post`가 `#sns`에서 `sns-manager` flow를 시작한다.
2. 사용자는 Instagram, Facebook, Homepage를 한 번에 선택할 수 있다.
3. 사용자는 홈페이지 업로드용 notice/gallery를 선택할 수 있다.
4. 사용자는 title, content, multiple image/mp4 attachment를 제출할 수 있다.
5. Bot은 채널별 상태를 반환한다.
6. 성공한 업로드는 결과 URL을 포함한다.
7. 실패하거나 skip된 업로드는 채널별로 명확한 사유를 보여준다.
8. 모든 시도는 나중에 확인할 수 있게 기록된다.

## 13. 미결정 사항

1. Creatorlink admin browser automation의 안정적인 selector와 게시 후 URL 추출 방식은 무엇인가?
2. Meta App Review/Advanced Access 제출에 필요한 테스트 app, privacy policy, screencast, reviewer credentials를 어떻게 준비할 것인가?
3. Meta access token 저장, 갱신, 폐기 정책은 어떻게 둘 것인가?
4. 파일 최대 개수와 최대 용량은 어떻게 제한할 것인가?
5. 업로드 전 승인자가 필요한가?
6. Meta API로 Instagram/Facebook 공식 음악 library 선택 또는 삽입을 지원할 수 있는가?

## 14. 참고

- Discord application command option은 attachment input을 지원한다: https://docs.discord.com/developers/interactions/application-commands
- Discord modal component는 form 형태 입력 수집에 적합하다: https://docs.discord.com/developers/components/using-modal-components
- Discord는 2025년에 modal file upload component를 추가했다: https://docs.discord.com/developers/change-log#introducing-the-file-upload-component-in-modals
- Instagram Content Publishing: https://developers.facebook.com/docs/instagram-platform/content-publishing/
- Facebook Pages API Posts: https://developers.facebook.com/docs/pages-api/posts/
- Meta App Review: https://developers.facebook.com/docs/resp-plat-initiatives/individual-processes/app-review/
- 이 PR에 반영된 local source note: `/home/twkim/Project/activities/SNS_POST_REQUIREMENTS.md`
