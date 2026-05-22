# Activities PRD 인덱스

Activities는 NGO/소규모 단체의 반복 운영 업무를 줄이는 업무 보조 서비스다.

현재 실행 방향은 하나의 Discord 서버에서 서비스별 채널을 나누고, 로컬에 설치한
Discord bot이 slash command, modal/form, 파일 입력을 처리하는 MVP다.

## 서비스

| 서비스 | PRD | 기본 사용 위치 |
| --- | --- | --- |
| `sns-manager` | `docs/prd-sns.md` | Discord `#sns` 채널 |
| `receipt-manager` | `docs/prd-receipts.md` | 로컬 Discord bot + 로컬 파일 저장소 + Google Sheets |
| `todo-manager` | `docs/prd-todo.md` | Discord `#todo` 채널 |

## 공통 구현 문서

| 문서 | 용도 |
| --- | --- |
| `docs/requirements/discord-bot-mvp.md` | Discord bot MVP 공통 요구사항과 제약 |
| `docs/discord-command-spec.md` | slash command, modal, 버튼, 응답 계약 |
| `docs/data-schema.md` | SQLite, Google Sheets, 로컬 파일 스키마 |
| `docs/tech-stack.md` | MVP 기술 스택과 로컬 실행 방식 |
| `TODOS.md` | 전체 구현 로드맵과 TODO 인덱스 |

## 제품 방향

첫 제품은 "모든 운영을 대체하는 플랫폼"이 아니다. 기존 사용 흐름을 최대한
유지하면서 반복 입력, 상태 확인, 누락 방지를 줄인다.

웹 UI, OCR provider, 회의록 분석/검색, 리포트 화면은 Discord bot workflow가
검증된 뒤 future issue로 재검토한다.

## 공통 원칙

1. 하나의 Discord 서버에서 서비스별 채널을 나누어 운영한다.
2. `sns-manager`는 `#sns`, `receipt-manager`는 `#receipt`, `todo-manager`는 `#todo` 채널을 기본 운영 공간으로 둔다.
3. 로컬에 설치한 Discord bot이 세 서비스의 slash command와 파일 입력을 처리한다.
4. MVP bot stack은 `docs/tech-stack.md`를 따른다.
5. Google Sheets는 초기 운영 기록과 행정 담당자 협업을 위한 저장소로 둔다.
6. Web/mobile UI는 Discord에서 처리하기 어려운 긴 목록, 지도, 파일 관리가 필요할 때만 보조 surface로 둔다.
7. 각 서비스는 독립적으로 성공하거나 실패할 수 있어야 한다.
8. KakaoTalk 자동화는 MVP 범위에서 제외한다.
9. Google Sheets, 파일 저장, 외부 업로드 같은 작업은 2~3번 재시도한 뒤 최종 실패 안내를 반환하고 종료한다.

## Discord 서버 구성

| 채널 | 서비스 | 주요 명령어 |
| --- | --- | --- |
| `#sns` | `sns-manager` | `/post` |
| `#receipt` | `receipt-manager` | `/receipt add`, `/receipt check`, `/receipt sheet status`, `/receipt sheet set` |
| `#todo` | `todo-manager` | `/todo add`, `/todo list`, `/todo status` |

## MVP 우선순위

1. 공통 로컬 bot 기반: Discord command 등록, 채널 검증, SQLite 설정, 재시도 처리.
2. `receipt-manager`: 로컬 Discord bot으로 영수증 사진을 저장하고, 송금 대기 상태를 Google Sheets에 남기며 `/receipt check`로 미완료 건수를 확인한다.
3. `sns-manager`: `#sns`에서 `/post`로 입력 수집과 결과 추적을 시작한다.
4. `todo-manager`: `#todo`에서 시작하되, 사용자 요구사항 확인 후 최소 명령어부터 구현한다.

## 공통 미결정 사항

1. 홈페이지 게시 API 또는 관리자 업로드 방식은 무엇인가?
2. Instagram/Facebook 자동 업로드는 Meta 권한 심사를 통과해야 하는가, 아니면 초기에는 수동 업로드 보조로 둘 것인가?
3. Google Sheets가 장기 source of truth인지, 임시 운영 장부인지 결정해야 한다.
4. `todo-manager`에서 Discord 명령만으로 충분한가, 아니면 지도/긴 리스트 때문에 보조 web/mobile UI가 필요한가?
