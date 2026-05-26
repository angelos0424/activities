# Discord 명령어 명세

이 문서는 로컬 Activities Discord bot의 공통 slash command 계약이다.

Bot은 하나의 Discord 서버에서 실행되며, 서비스별 채널을 나누어 사용한다.

| 채널 | 서비스 | 명령어 |
| --- | --- | --- |
| `#sns` | `sns-manager` | `/post` |
| `#receipt` | `receipt-manager` | `/receipt add`, `/receipt check`, `/receipt sheet status`, `/receipt sheet set` |
| `#todo` | `todo-manager` | `/todo add`, `/todo list`, `/todo status` |

## 공통 규칙

1. 명령어는 기대한 서비스 채널에서 실행됐는지 검증해야 한다.
2. Google Sheets, 파일 업로드, 외부 서비스 게시처럼 시간이 걸리는 작업은 긴 작업을 시작하기 전에 Discord interaction을 defer해야 한다.
3. 외부 작업 실패는 2~3번 재시도한 뒤 최종 실패 안내를 반환하고 flow를 종료한다.
4. 재시도 loop는 Google Sheets row, 로컬 파일, `sns-manager` post를 중복 생성하면 안 된다.
5. 최종 실패 메시지는 짧고 사용자가 이해할 수 있어야 하며, 다음 수동 조치를 포함해야 한다.
6. 내부 stack trace, token, Google credential, 로컬 absolute path는 Discord에 표시하지 않는다.
7. 같은 서버에서 여러 서비스를 쓰므로 가능하면 서비스 namespace를 가진 command를 사용한다.
8. Discord modal은 text input 외에도 select, checkbox, file upload component를 지원한다. 단, SDK/runtime version이 해당 component를 지원하지 않으면 slash command option 또는 modal 제출 후 message component select menu/button으로 받는다.

## `/post`

서비스: `sns-manager`
채널: `#sns`

### Runtime boundary

초기 Discord bot runtime은 `/post` slash command를 등록하고, command 실행 시 아래 순서로 처리한다.

```text
Discord /post interaction
  |
  v
bot command router
  |
  |-- channel id가 DISCORD_SNS_CHANNEL_IDS에 없으면 ephemeral 거부
  |
  v
sns-manager domain handler
  |
  v
ephemeral 시작 응답
```

이 boundary는 Discord SDK type을 domain handler에 직접 넘기지 않는다. 후속 target select,
modal submit, attachment flow는 `bot/interactions`와 `bot/modals`의 handler interface 뒤에
연결한다.

### 목적

Instagram, Facebook, 홈페이지 중 하나 이상에 올릴 게시물 업로드 flow를 시작한다.

### 입력

| 필드 | 타입 | 필수 | 메모 |
| --- | --- | --- | --- |
| targets | multi-select | yes | `instagram`, `facebook`, `homepage` |
| homepage_type | select | 조건부 | `homepage` 선택 시 필수. 값: `notice`, `gallery` |
| title | text | yes | 게시 제목 |
| content | text | yes | 게시 본문 |
| assets | attachments | 조건부 | JPEG/PNG 이미지 또는 MP4. 여러 개 허용. Instagram과 video/Reels flow에는 필수이고, homepage notice는 text-only일 수 있음 |
| audio | object | no | 선택적 video/Reels metadata 또는 업로드된 audio reference. 실제 Meta music library 지원 여부는 미결정 |

### 권장 Discord UX

결정: `/post`는 Discord modal file upload를 1차 입력 방식으로 사용한다.

확인 결과:

- Discord Components reference는 modal 안의 `File Upload` component를 지원하며, 업로드 개수는 `min_values`/`max_values`로 0~10개 사이에서 설정할 수 있다.
- 선택한 SDK인 `discord.js`는 `14.24.0` 문서 기준 `FileUploadModalData`와 modal file upload builder/data path를 제공한다.
- Discord는 modal submit payload에 파일 byte를 직접 넣지 않는다. Bot은 submit payload의 attachment metadata/CDN URL을 받아 파일을 내려받은 뒤 자체 검증해야 한다.
- `discord.js` guide 기준 modal file upload component는 파일 크기나 확장자를 client-side로 제한할 수 없다. 형식과 크기는 modal submit 후 bot이 검증한다.

근거 문서:

- Discord Components Reference: https://docs.discord.com/developers/components/reference#file-upload
- discord.js `FileUploadModalData`: https://discord.js.org/docs/packages/discord.js/14.24.0/FileUploadModalData%3AInterface
- discord.js modal file upload guide: https://discordjs.guide/legacy/interactions/modals#file-upload

Command adapter는 `discord.js >= 14.24.0`을 기준으로 설계한다. 실제 구현 시 설치된 SDK version이 file upload builder를 제공하지 않거나 Discord client 호환성 문제가 확인되면 아래 대체 UX로 전환한다.

```text
/post
  |
  v
target 선택 메시지
  |-- targets: instagram / facebook / homepage
  |-- homepage_type: homepage 선택 시 notice / gallery
  |
  v
post 작성 modal
  |-- title text input
  |-- content text input
  |-- assets file upload, min/max는 선택한 target에 따라 설정
  |
  v
modal submit
  |
  v
CDN download -> validation -> local file metadata 저장 -> target별 upload/manual packet
```

Flow:

1. 사용자가 `#sns`에서 `/post`를 실행한다.
2. Bot이 ephemeral setup message를 보내고 target multi-select를 받는다.
3. `homepage`가 선택되면 `homepage_type` select를 추가로 받는다.
4. Bot이 target 선택 interaction에 대한 첫 응답으로 post 작성 modal을 연다. Modal을 열기 전에는 해당 interaction을 defer하지 않는다.
5. Modal은 `title`, `content`, `assets` file upload를 받는다.
6. Bot은 modal submit 후 interaction을 defer하고 Discord CDN에서 attachment를 내려받는다.
7. Bot이 모든 asset을 검증한 뒤 target별 진행 상태 메시지를 표시한다.
8. Bot이 결과 URL 또는 최종 실패 메시지를 반환한다.

File upload 설정:

| 조건 | `assets.required` | `min_values` | `max_values` | 메모 |
| --- | --- | --- | --- | --- |
| `homepage`만 선택했고 `homepage_type=notice` | false | 0 | 10 | text-only notice 허용 |
| 그 외 모든 target 조합 | true | 1 | 10 | Instagram, Facebook, homepage gallery, video/Reels 후보는 파일 필수 |

### 대체 Discord UX

선택한 Discord SDK/runtime에서 modal file upload가 안정적이지 않거나 운영 Discord client에서 submit 문제가 재현되면 아래 방식으로 진행한다.

1. `/post`가 target과 `homepage_type`을 먼저 받는다.
2. Bot이 title/content 입력 modal을 연다.
3. Bot이 non-ephemeral 안내 메시지 또는 bot이 만든 public thread를 열고 `이 채널/thread에 이미지/영상 파일을 업로드한 뒤 제출 완료를 눌러주세요.`라고 안내한다. Ephemeral 메시지는 사용자가 reply할 수 없으므로 attachment 수집 안내에 사용하지 않는다.
4. 사용자는 안내 메시지에 reply할 필요 없이 같은 channel/thread에 attachment 메시지를 하나 이상 올린다. Public 안내 메시지에 reply한 attachment도 같은 pending upload window 안이면 수집 대상이다.
5. Bot은 같은 user, 같은 channel/thread, 같은 pending post id에 연결된 message attachment만 수집한다.
6. Bot은 사용자가 `제출 완료` 버튼을 누르거나 attachment 수집 timeout이 끝날 때까지 도착한 파일을 pending upload set에 추가한 뒤 검증하고 업로드 flow를 계속 진행한다.

대체 UX 구현 주의:

- Message attachment 수집 방식은 `MESSAGE_CREATE` gateway event와 message attachment 접근 권한이 필요하다. Test Discord server에서 bot intent와 attachment payload 수신 여부를 먼저 검증한다.
- Pending post state는 SQLite에 `pending_asset_upload` 상태로 저장하고, timeout 또는 취소 시 정리한다.
- 사용자별 같은 channel/thread에는 active `pending_asset_upload`를 1개만 허용한다. 이미 수집 중인 pending이 있으면 새 `/post`는 기존 flow를 끝내거나 취소하라고 안내한다.
- 사용자가 잘못된 channel/thread에 올리면 파일을 무시하고 pending 안내 메시지만 갱신한다.

### 검증 정책

- `links`는 `/post` payload에서 의도적으로 제외한다. 확인된 SNS 요구사항 source에 포함되지 않았기 때문이다.
- 제출 전 검증 실패는 전체 요청을 중단하고 수정 안내를 반환한다.
- 요청이 유효하고 업로드가 시작된 뒤의 runtime upload failure는 target별로 추적한다. 성공한 target은 다시 시도하지 않아도 된다.
- `assets`는 한 요청에서 최대 10개까지 받는다. Discord modal file upload 자체의 상한도 10개다.
- 허용 파일은 JPEG(`image/jpeg`), PNG(`image/png`), MP4(`video/mp4`)로 제한한다. `image/*`는 SVG/WebP처럼 target SNS upload adapter가 처리하지 못할 수 있는 포맷까지 포함하므로 사용하지 않는다. 구현은 filename만 믿지 말고 Discord attachment `content_type`, CDN response `Content-Type`, 가능한 경우 file signature를 함께 확인한다.
- 파일 크기는 Discord 사용자의 channel upload limit에 의해 client-side로 결정된다. Bot은 local storage/provider upload 한도를 별도 config로 두고 submit 후 검증한다.
- validation 실패 시 batch 전체를 거절한다. 일부 파일만 저장하거나 일부 target upload를 시작하지 않는다.
- 대체 UX에서 `pending_asset_upload` 상태인 동안 같은 user/channel/thread에서 도착한 attachment 메시지는 중복이 아니라 같은 batch의 수집 대상으로 처리한다.
- 사용자가 `제출 완료`를 누르거나 timeout으로 수집이 닫히면 state를 `validating_assets`로 전환한다. 이 시점 이후 같은 pending post에 modal submit, attachment message, `제출 완료` interaction이 추가로 도착하면 "이미 처리 중"으로 응답한다.

Validation 실패 응답 예시:

```text
게시물 파일을 확인해주세요.
- logo.svg: JPEG/PNG 이미지 또는 MP4만 업로드할 수 있습니다.
- photo.webp: JPEG/PNG 이미지만 지원합니다.
- clip.mov: mp4만 지원합니다.

다음 조치: `/post`를 다시 실행해 파일을 다시 첨부해주세요.
```

파일 누락 응답 예시:

```text
파일이 필요합니다.
Instagram, Facebook, gallery 게시물은 이미지 또는 mp4를 1개 이상 첨부해야 합니다.
```

### 성공 응답

Bot은 target별 결과 block을 반환한다.

```text
업로드 결과
- Homepage: 완료 https://...
- Instagram: 완료 https://...
- Facebook: 수동 업로드 필요
```

Homepage는 Creatorlink admin browser automation으로 notice/gallery 포스팅을 완료하고, 게시 후 생성된 public URL을 결과로 반환한다. 자동화 실패 시 homepage target만 실패 처리하고 안전한 실패 메시지와 재시도 action을 반환한다.

Instagram/Facebook은 Meta App Review/Advanced Access와 publishing permission이 준비되기 전까지 `manual_required` 상태를 반환한다. 권한이 준비된 target은 자동 업로드 후 결과 URL을 반환하고, 권한이 없는 target은 title/content/assets 기반 manual upload packet을 함께 제공한다.

### 실패 응답

2~3번 재시도 후:

```text
Instagram 업로드 실패
사유: 권한 또는 API 설정을 확인해야 합니다.
다음 조치: 아래 준비된 문구와 파일로 수동 업로드해주세요.
```

## `/receipt add`

서비스: `receipt-manager`
채널: `#receipt`

### 목적

사람/단체 기준 송금 row를 만들고, 로컬에 저장한 영수증 이미지를 연결한다.

### 입력

| 필드 | 타입 | 필수 | 메모 |
| --- | --- | --- | --- |
| name | text | yes | People Sheet에서 검색할 사람/단체명 |

### Flow

1. 사용자가 `/receipt add name:"..."`을 실행한다.
2. Bot이 People Sheet를 검색한다.
3. 하나 이상의 후보가 있으면 확인/선택 버튼과 함께 보여준다.
4. 후보가 없으면 신규 사람/단체 입력 form을 연다.
5. Bot이 상태 `송금전`인 Transfers Sheet row를 만든다.
6. Bot이 영수증 이미지 업로드를 요청한다.
7. Bot이 이미지를 `data/receipts/{yyyy}/{MM}/{HHMMSS}/{fileid}`에 저장한다.
8. Bot이 파일 metadata를 기록하고 transfer row에 로컬 경로를 연결한다.
9. Bot이 생성된 송금 요청 요약을 반환한다.

### 신규 사람/단체 form

| 필드 | 타입 | 필수 | 메모 |
| --- | --- | --- | --- |
| name | text | yes | 검색한 이름을 기본값으로 사용 |
| type | choice/select menu | yes | `person`, `organization`. Modal 밖의 slash option 또는 message component로 받음 |
| contact | text | yes | 자유 텍스트 |
| account | text | no | 은행/예금주/계좌번호 |

### 성공 응답

```text
영수증 등록 완료
- 이름: 홍길동
- 상태: 송금전
- 저장 위치: data/receipts/2026/05/143012/receipt_01
```

### 실패 응답

2~3번 재시도 후:

```text
영수증 등록 실패
사유: Google Sheets에 송금 이력을 저장하지 못했습니다.
다음 조치: 잠시 후 다시 시도하거나 담당자에게 수기 등록을 요청해주세요.
```

## `/receipt check`

서비스: `receipt-manager`
채널: `#receipt`

### 목적

송금 row를 집계하고 완료되지 않은 건수를 보여준다.

### 입력

필수 입력은 없다.

향후 추가할 수 있는 optional filter:

| 필드 | 타입 | 필수 | 메모 |
| --- | --- | --- | --- |
| status | select | no | `송금전`, `보류`, `완료`, `all` |
| limit | integer | no | 표시할 미완료 row 최대 개수 |

### 응답

```text
송금 현황
- 전체: 18건
- 미완료: 4건

미완료 목록
1. 홍길동 / 송금전 / 2026-05-22
2. 활동팀 / 보류 / 2026-05-21
```

## `/receipt sheet status`

서비스: `receipt-manager`
채널: `#receipt`

### 목적

현재 설정된 People Sheet와 Transfers Sheet를 보여준다.

### 응답

```text
Receipt Sheets
- People Sheet: 설정됨
- Transfers Sheet: 설정됨
- 마지막 변경: 2026-05-22 by @admin
```

## `/receipt sheet set`

서비스: `receipt-manager`
채널: `#receipt`

### 목적

영수증 관련 Google Sheets URL을 변경한다.

### 입력

| 필드 | 타입 | 필수 | 메모 |
| --- | --- | --- | --- |
| people | url/text | yes | People Sheet URL 또는 Sheet ID |
| transfers | url/text | yes | Transfers Sheet URL 또는 Sheet ID |

### 권한

이 명령어는 admin 전용이다. 정확한 Discord role 이름은 구현 config 값으로 둔다.

### Flow

1. 사용자 권한을 검증한다.
2. 두 URL 또는 ID를 검증한다.
3. Google service account가 두 Sheet를 read/write할 수 있는지 확인한다.
4. 값을 SQLite `bot_config`에 저장한다.
5. 확인 메시지를 반환한다.

## `/todo add`

서비스: `todo-manager`
채널: `#todo`

### 목적

일정 또는 todo item을 만든다.

### 입력

| 필드 | 타입 | 필수 | 메모 |
| --- | --- | --- | --- |
| title | text | yes | 일정/todo 제목 |
| description | text | no | 상세 내용 |
| starts_at | datetime/text | yes | MVP에서는 텍스트로 받은 뒤 나중에 정규화할 수 있음 |
| estimated_duration_minutes | integer | no | 예상 소요 시간 |
| location_name | text | no | 장소명 |
| location_address | text | no | 주소 또는 지도 검색어 |
| related_party | text/autocomplete/select menu | no | 사람 또는 단체. Modal 밖에서 선택하거나 text로 받은 뒤 확인 |
| type | choice/select menu | yes | `meeting`, `meetup`, `project`, `admin`, `other`. Modal 밖의 slash option 또는 message component로 받음 |

### 응답

```text
일정 등록 완료
- 제목: 운영 회의
- 시간: 2026-05-22 19:00
- 상태: wait
```

## `/todo list`

서비스: `todo-manager`
채널: `#todo`

### 목적

예정된 항목과 미완료 일정/todo를 보여준다.

### 입력

| 필드 | 타입 | 필수 | 메모 |
| --- | --- | --- | --- |
| range | select | no | `today`, `week`, `all`. 기본값: `today` |
| status | select | no | `wait`, `progress`, `done`, `dismiss`, `open`. 기본값: `open` |
| type | select | no | 선택적 type filter |

### 정렬

1. 오늘 일정 먼저.
2. `starts_at`이 빠른 순.
3. `wait`, `progress`가 `done`, `dismiss`보다 먼저.

## `/todo status`

서비스: `todo-manager`
채널: `#todo`

### 목적

일정/todo 상태를 변경한다.

### 입력

| 필드 | 타입 | 필수 | 메모 |
| --- | --- | --- | --- |
| item_id | autocomplete string | yes | 변경할 item id. `/todo list` 결과의 버튼/select menu에서 선택할 수도 있음 |
| status | select | yes | `wait`, `progress`, `done`, `dismiss` |
| result_note | text | no | 필요하면 일부 done flow에서 필수로 바꿀 수 있음 |
| result_link | text | no | 선택적 결과 링크 |

### 응답

```text
상태 변경 완료
- 운영 회의: progress
```
