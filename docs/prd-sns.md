# PRD: SNS Upload Service

## 1. Summary

SNS 업로드 서비스는 Discord `#sns` 채널에서 `/post` 명령어로 시작하고, form 형태로 게시 채널, 홈페이지 분류, 제목, 내용, 이미지/영상 파일을 받아 Instagram, Facebook, 홈페이지에 업로드하거나 업로드 준비물을 생성한다.

MVP의 핵심은 "여러 채널에 올라가야 하는 공지/갤러리 게시물이 누락되지 않게 하고, 결과 URL을 한곳에 남기는 것"이다.

## 2. Goals

1. 사용자가 Discord `#sns` 채널에서 `/post`로 SNS 업로드 작업을 시작한다.
2. 사용자가 업로드 채널을 선택한다: Instagram, Facebook, Homepage.
3. 홈페이지 업로드 시 공지/갤러리 중 하나를 선택한다.
4. 사용자가 title, content, 이미지/영상 파일을 제출한다.
5. 시스템이 업로드 결과 URL을 채널별로 반환한다.
6. 실패한 채널은 실패 사유와 재시도 방법을 보여준다.

## 3. Non-goals for MVP

1. 모든 SNS 플랫폼 지원.
2. KakaoTalk 자동 업로드.
3. 게시 예약 시스템.
4. 승인 워크플로우 전체 구현.
5. 복잡한 콘텐츠 편집기.
6. AI 문구 생성.

## 4. Users

| User | Need |
| --- | --- |
| SNS 담당자 | 같은 게시물을 여러 채널에 빠짐없이 올리고 결과 URL을 남긴다. |
| 총무/운영 담당자 | 업로드 누락 여부와 결과 링크를 확인한다. |
| 홈페이지 관리자 | 홈페이지 공지/갤러리 게시 위치를 구분해 업로드한다. |

## 5. User Flow

### 5.1 Create Post

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
9. Bot이 채널별 업로드를 실행하거나 수동 업로드용 산출물을 만든다.
10. Bot이 결과 URL 또는 실패 사유를 반환한다.

### 5.2 Result Review

1. Bot이 `#sns` 또는 생성된 thread에 채널별 상태를 표시한다.
2. 성공한 채널은 URL을 보여준다.
3. 실패한 채널은 재시도 버튼을 보여준다.
4. 전체 결과는 Google Sheets 또는 DB에 기록한다.

## 6. Discord UX Requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| SNS-UX-001 | `#sns` 채널에서 `/post` 명령어를 제공한다. | P0 |
| SNS-UX-002 | 채널 선택은 checkbox 또는 multi-select 형태로 제공한다. | P0 |
| SNS-UX-003 | 홈페이지 선택 시 공지/갤러리 선택 UI를 제공한다. | P0 |
| SNS-UX-004 | title/content는 Discord modal/form으로 입력받는다. | P0 |
| SNS-UX-005 | 이미지/영상은 multiple upload를 지원한다. | P0 |
| SNS-UX-006 | 업로드 진행 중 상태를 Discord message로 표시한다. | P0 |
| SNS-UX-007 | 채널별 결과 URL을 반환한다. | P0 |

## 7. Platform Feasibility Notes

Discord slash command option으로 attachment를 받을 수 있고 modal은 text input과 select류 입력에 적합하다. Discord는 2025년에 modal file upload component를 추가했지만, 실제 라이브러리 지원과 운영 안정성은 구현 전에 확인해야 한다.

MVP fallback:

1. `/post`로 title/content/channel/options를 받는다.
2. Bot이 "이 메시지에 이미지/영상 파일을 reply로 업로드하세요"라고 안내한다.
3. 사용자가 파일을 메시지 첨부로 올린다.
4. Bot이 해당 attachments를 수집해 업로드 작업을 진행한다.

## 8. Source Requirement Notes

This PRD incorporates the local source note `SNS_POST_REQUIREMENTS.md` from the working tree used before PR 109. When that note conflicts with the PR 109 documentation set, PR 109 remains the organizing source of truth and the note is folded in as implementation detail.

Confirmed `/post` source requirements:

1. Select upload targets: Instagram, Facebook, Homepage.
2. If Homepage is selected, choose Notice or Gallery.
3. Enter `title` and `content` through Discord modal/form UX where possible.
4. Upload multiple image files or mp4 videos.
5. Return result URLs per target.
6. Exclude a generic `links` field until a confirmed requirement introduces it.
7. Include optional `audio` metadata for video/Reels planning, but keep actual Meta music-library support as an open question.

Conflict handling:

- Source note says validation failure should stop the whole request; PR 109 says one channel failure should not block other channels. Use both by phase: input validation failure stops the request before upload; after upload starts, failures are recorded per target and successful targets remain successful.
- Source note says Homepage should not add a separate DB. PR 109 keeps SQLite request/target tracking as the MVP source of truth; Homepage adapter code should avoid its own additional homepage-specific database unless a future issue requires it.

## 9. Functional Requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| SNS-FE-001 | Discord `/post` command schema를 정의한다. | P0 |
| SNS-FE-002 | Discord modal/form 입력을 처리한다. | P0 |
| SNS-FE-003 | 파일 첨부 수집 및 검증을 처리한다. | P0 |
| SNS-FE-004 | Homepage 업로드 adapter를 제공한다. | P0 |
| SNS-FE-005 | Instagram upload adapter를 제공한다. | P1 |
| SNS-FE-006 | Facebook upload adapter를 제공한다. | P1 |
| SNS-FE-007 | 채널별 업로드 결과를 저장한다. | P0 |
| SNS-FE-008 | 실패한 채널만 재시도할 수 있다. | P1 |
| SNS-FE-009 | Pre-submit validation failure stops the whole request and returns suggested fixes. | P0 |
| SNS-FE-010 | `links` is excluded from the initial payload unless a later requirement confirms it. | P1 |
| SNS-FE-011 | Optional `audio` metadata is allowed for video/Reels planning, with provider support verified separately. | P2 |

## 10. Data Model

### `sns_posts`

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid | internal id |
| discord_guild_id | string | Discord server id |
| discord_channel_id | string | `#sns` channel id |
| requested_by | string | Discord user id |
| title | text | post title |
| content | text | post body |
| homepage_type | enum | notice, gallery, none |
| status | enum | draft, processing, partial_success, success, failed |
| created_at | timestamp | created time |
| updated_at | timestamp | updated time |

### `sns_post_targets`

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid | internal id |
| post_id | uuid | parent post |
| target | enum | instagram, facebook, homepage |
| status | enum | pending, processing, success, failed, skipped |
| result_url | text | returned URL |
| error_message | text | safe error for user |
| retry_count | integer | retry attempts |

### `sns_post_assets`

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid | internal id |
| post_id | uuid | parent post |
| source_attachment_url | text | source URL |
| mime_type | text | image or video |
| size_bytes | bigint | file size |
| storage_url | text | persisted copy if needed |

## 11. Validation Rules

1. Title is required.
2. Content is required.
3. At least one target channel is required.
4. Homepage target requires homepage_type.
5. Assets must be image or mp4.
6. Multiple assets are allowed, but each platform adapter may enforce its own limit.
7. If platform upload is not configured, return "manual upload required" with prepared content instead of silently failing.
8. Pre-submit validation failures stop the entire request and suggest corrections.
9. Runtime upload failures are per-target after validation succeeds.
10. The initial payload does not include `links`.
11. `audio` is optional and only used when a video/Reels flow requires it.

## 12. Acceptance Criteria

1. `/post` starts the SNS upload flow in `#sns`.
2. User can choose Instagram, Facebook, Homepage in one request.
3. User can choose notice/gallery for homepage uploads.
4. User can submit title, content, and multiple image/mp4 attachments.
5. Bot returns per-channel status.
6. Successful uploads include result URLs.
7. Failed uploads show clear, channel-specific failure messages.
8. All attempts are recorded for later review.

## 13. Open Questions

1. 홈페이지는 어떤 CMS/API를 쓰는가?
2. Instagram/Facebook은 단체 계정이 Business/Page 권한을 갖고 있는가?
3. Meta app review를 통과할 계획인가, 아니면 MVP는 홈페이지 자동 업로드 + SNS 수동 보조로 갈 것인가?
4. 파일 최대 개수와 최대 용량은 어떻게 제한할 것인가?
5. 업로드 전 승인자가 필요한가?
6. Meta API로 Instagram/Facebook 공식 음악 라이브러리 선택 또는 삽입을 지원할 수 있는가?

## 14. References

- Discord application command options include attachment input: https://docs.discord.com/developers/interactions/application-commands
- Discord modal components support form-style collection: https://docs.discord.com/developers/components/using-modal-components
- Discord added modal file upload components in 2025: https://docs.discord.com/developers/change-log#introducing-the-file-upload-component-in-modals
- Local source note folded into this PR: `/home/twkim/Project/activities/SNS_POST_REQUIREMENTS.md`
