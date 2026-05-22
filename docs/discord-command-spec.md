# Discord 명령어 명세

이 문서는 로컬 Activities Discord bot의 공통 slash command 계약이다.

Bot은 하나의 Discord 서버에서 실행되며, 서비스별 채널을 나누어 사용한다.

| 채널 | 서비스 | 명령어 |
| --- | --- | --- |
| `#sns` | SNS 업로드 | `/post` |
| `#receipt` | 영수증 및 송금 상태 | `/receipt add`, `/receipt check`, `/receipt sheet status`, `/receipt sheet set` |
| `#todo` | Todo 및 일정 | `/todo add`, `/todo list`, `/todo status` |

## 공통 규칙

1. 명령어는 기대한 서비스 채널에서 실행됐는지 검증해야 한다.
2. Google Sheets, 파일 업로드, 외부 서비스 게시처럼 시간이 걸리는 작업은 긴 작업을 시작하기 전에 Discord interaction을 defer해야 한다.
3. 외부 작업 실패는 2~3번 재시도한 뒤 최종 실패 안내를 반환하고 flow를 종료한다.
4. 재시도 loop는 Google Sheets row, 로컬 파일, SNS post를 중복 생성하면 안 된다.
5. 최종 실패 메시지는 짧고 사용자가 이해할 수 있어야 하며, 다음 수동 조치를 포함해야 한다.
6. 내부 stack trace, token, Google credential, 로컬 absolute path는 Discord에 표시하지 않는다.
7. 같은 서버에서 여러 서비스를 쓰므로 가능하면 서비스 namespace를 가진 command를 사용한다.

## `/post`

서비스: SNS 업로드
채널: `#sns`

### 목적

Instagram, Facebook, 홈페이지 중 하나 이상에 올릴 게시물 업로드 flow를 시작한다.

### 입력

| 필드 | 타입 | 필수 | 메모 |
| --- | --- | --- | --- |
| targets | multi-select | yes | `instagram`, `facebook`, `homepage` |
| homepage_type | select | 조건부 | `homepage` 선택 시 필수. 값: `notice`, `gallery` |
| title | text | yes | 게시 제목 |
| content | text | yes | 게시 본문 |
| assets | attachments | 조건부 | 이미지 또는 mp4. 여러 개 허용. Instagram과 video/Reels flow에는 필수이고, homepage notice는 text-only일 수 있음 |
| audio | object | no | 선택적 video/Reels metadata 또는 업로드된 audio reference. 실제 Meta music library 지원 여부는 미결정 |

### 권장 Discord UX

1. 사용자가 `/post`를 실행한다.
2. Bot이 title/content 입력 modal/form을 연다.
3. Bot이 select menu 또는 button으로 target 선택을 받는다.
4. Bot이 이미지/mp4 attachment를 요청한다.
5. Bot이 target별 진행 상태 메시지를 표시한다.
6. Bot이 결과 URL 또는 최종 실패 메시지를 반환한다.

### 대체 Discord UX

선택한 Discord SDK에서 modal file upload가 안정적이지 않으면 아래 방식으로 진행한다.

1. `/post`가 title, content, target, homepage_type을 받는다.
2. Bot이 `이미지/영상 파일을 이 메시지에 reply로 업로드해주세요.`라고 안내한다.
3. Bot이 reply 또는 thread에서 attachment를 수집한다.
4. Bot이 업로드 flow를 계속 진행한다.

### 검증 정책

- `links`는 `/post` payload에서 의도적으로 제외한다. 확인된 SNS 요구사항 source에 포함되지 않았기 때문이다.
- 제출 전 검증 실패는 전체 요청을 중단하고 수정 안내를 반환한다.
- 요청이 유효하고 업로드가 시작된 뒤의 runtime upload failure는 target별로 추적한다. 성공한 target은 다시 시도하지 않아도 된다.

### 성공 응답

Bot은 target별 결과 block을 반환한다.

```text
업로드 결과
- Homepage: 완료 https://...
- Instagram: 완료 https://...
- Facebook: 수동 업로드 필요
```

### 실패 응답

2~3번 재시도 후:

```text
Instagram 업로드 실패
사유: 권한 또는 API 설정을 확인해야 합니다.
다음 조치: 아래 준비된 문구와 파일로 수동 업로드해주세요.
```

## `/receipt add`

서비스: 영수증
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
| type | select | yes | `person`, `organization` |
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

서비스: 영수증
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

서비스: 영수증
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

서비스: 영수증
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

서비스: Todo
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
| related_party | text/select | no | 사람 또는 단체 |
| type | select | yes | `meeting`, `meetup`, `project`, `admin`, `other` |

### 응답

```text
일정 등록 완료
- 제목: 운영 회의
- 시간: 2026-05-22 19:00
- 상태: wait
```

## `/todo list`

서비스: Todo
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

서비스: Todo
채널: `#todo`

### 목적

일정/todo 상태를 변경한다.

### 입력

| 필드 | 타입 | 필수 | 메모 |
| --- | --- | --- | --- |
| item | text/select | yes | item id 또는 선택된 item |
| status | select | yes | `wait`, `progress`, `done`, `dismiss` |
| result_note | text | no | 필요하면 일부 done flow에서 필수로 바꿀 수 있음 |
| result_link | text | no | 선택적 결과 링크 |

### 응답

```text
상태 변경 완료
- 운영 회의: progress
```
