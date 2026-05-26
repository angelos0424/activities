# PRD: `sns-manager` 서비스

## 1. 요약

`sns-manager` 서비스는 Discord `#sns` 채널에서 `/post` 명령어로 시작한다. 사용자는 form 형태로 업로드 채널, 홈페이지 분류, 제목, 내용, 이미지/영상 파일을 입력하고, bot은 Instagram, Facebook, 홈페이지에 업로드하거나 업로드 준비물을 만든다.

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
9. Bot이 채널별 업로드를 실행하거나 수동 업로드용 산출물을 만든다. Homepage는 target config와 API/admin flow가 확인되기 전까지 수동 업로드용 산출물을 만든다.
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

현재 repository 문서/코드에는 실제 홈페이지 URL, CMS 종류, admin flow, notice/gallery API endpoint, 인증 방식이 없다. `docs/data-schema.md`의 `sns-manager.homepage_target`은 config placeholder이고, `sns/.env.example`에는 homepage adapter 설정값이 없다. `sns-manager` runtime도 현재 `/post` command boundary와 domain routing만 제공하며, homepage upload adapter는 구현되어 있지 않다.

판정:

1. 현 상태에서는 API로 notice/gallery를 자동 생성할 수 있다고 볼 근거가 없다.
2. Homepage target은 `homepage_type=notice|gallery` 분류까지만 확정한다.
3. MVP는 Homepage에 대해 `manual_required` 상태와 수동 업로드 패킷을 반환해야 한다.
4. 자동 업로드는 홈페이지 URL/admin URL, CMS/vendor, 관리자 권한, API 문서 또는 webhook 지원 여부, notice/gallery content model, 파일 업로드 제한, draft/publish 권한이 확인된 뒤 별도 adapter issue에서 구현한다.

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
| SNS-FE-004 | Homepage 업로드 adapter를 제공한다. Target config/API가 확인되기 전에는 `manual_required`와 수동 업로드 패킷을 반환한다. | P0 |
| SNS-FE-005 | Instagram upload adapter를 제공한다. | P1 |
| SNS-FE-006 | Facebook upload adapter를 제공한다. | P1 |
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

### `sns_post_targets`

| 필드 | 타입 | 메모 |
| --- | --- | --- |
| id | uuid | 내부 id |
| post_id | uuid | parent post |
| target | enum | instagram, facebook, homepage |
| status | enum | pending, processing, success, failed, manual_required, skipped |
| result_url | text | 결과 URL. `manual_required`이면 비워둘 수 있으며, 수동 업로드 패킷은 `sns_posts`와 `sns_post_assets` 데이터를 조합해 런타임에 생성함 |
| error_message | text | 사용자에게 보여줄 수 있는 오류 |
| retry_count | integer | 재시도 횟수 |

### `sns_post_assets`

| 필드 | 타입 | 메모 |
| --- | --- | --- |
| id | uuid | 내부 id |
| post_id | uuid | parent post |
| source_attachment_url | text | source URL |
| mime_type | text | 이미지 또는 영상 |
| size_bytes | bigint | 파일 크기 |
| storage_url | text | 필요 시 저장된 copy |

## 11. 검증 규칙

1. Title은 필수다.
2. Content는 필수다.
3. 하나 이상의 target channel이 필요하다.
4. Homepage target은 homepage_type이 필요하다.
5. Asset은 image 또는 mp4여야 한다.
6. 여러 asset을 허용하되, 각 platform adapter가 자체 제한을 둘 수 있다.
7. Platform upload가 설정되지 않았으면 조용히 실패하지 말고 "manual upload required"와 준비된 content를 반환한다.
8. 제출 전 검증 실패는 전체 요청을 중단하고 수정 안내를 반환한다.
9. Runtime upload failure는 validation이 성공한 뒤 target별로 기록한다.
10. Initial payload에는 `links`를 포함하지 않는다.
11. `audio`는 optional이며 video/Reels flow에서 필요할 때만 사용한다.

## 12. 인수 조건

1. `/post`가 `#sns`에서 `sns-manager` flow를 시작한다.
2. 사용자는 Instagram, Facebook, Homepage를 한 번에 선택할 수 있다.
3. 사용자는 홈페이지 업로드용 notice/gallery를 선택할 수 있다.
4. 사용자는 title, content, multiple image/mp4 attachment를 제출할 수 있다.
5. Bot은 채널별 상태를 반환한다.
6. 성공한 업로드는 결과 URL을 포함한다.
7. 실패한 업로드는 채널별로 명확한 실패 메시지를 보여준다.
8. 모든 시도는 나중에 확인할 수 있게 기록된다.

## 13. 미결정 사항

1. 홈페이지는 어떤 CMS/API를 쓰는가? 현재 repository 기준 미확인이다.
2. Instagram/Facebook은 단체 계정이 Business/Page 권한을 갖고 있는가?
3. Meta app review를 통과할 계획인가, 아니면 MVP는 홈페이지 자동 업로드 + SNS 수동 보조로 갈 것인가?
4. 파일 최대 개수와 최대 용량은 어떻게 제한할 것인가?
5. 업로드 전 승인자가 필요한가?
6. Meta API로 Instagram/Facebook 공식 음악 library 선택 또는 삽입을 지원할 수 있는가?

## 14. 참고

- Discord application command option은 attachment input을 지원한다: https://docs.discord.com/developers/interactions/application-commands
- Discord modal component는 form 형태 입력 수집에 적합하다: https://docs.discord.com/developers/components/using-modal-components
- Discord는 2025년에 modal file upload component를 추가했다: https://docs.discord.com/developers/change-log#introducing-the-file-upload-component-in-modals
- 이 PR에 반영된 local source note: `/home/twkim/Project/activities/SNS_POST_REQUIREMENTS.md`
