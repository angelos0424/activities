# Activities PRD Index

Activities는 NGO/소규모 단체의 반복 운영 업무를 줄이는 업무 보조 서비스다.

현재 실행 방향은 하나의 Discord 서버에서 서비스별 채널을 나누고, 로컬에 설치한
Discord bot이 slash command, modal/form, 파일 입력을 처리하는 MVP다.

## Services

| Service | PRD | Primary surface |
| --- | --- | --- |
| SNS 업로드 | `docs/prd-sns.md` | Discord bot in `#sns` |
| 영수증 | `docs/prd-receipts.md` | Local Discord bot + local file storage + Google Sheets |
| Todo | `docs/prd-todo.md` | Discord bot in `#todo` |

## Shared Implementation Documents

| Document | Purpose |
| --- | --- |
| `docs/requirements/discord-bot-mvp.md` | General Discord bot MVP requirements and constraints. |
| `docs/discord-command-spec.md` | Slash command, modal, button, and response contract. |
| `docs/data-schema.md` | SQLite, Google Sheets, and local file schema. |
| `docs/tech-stack.md` | MVP stack and local runtime decisions. |
| `Roadmap.md` | Cross-service implementation order. |

## Product Direction

첫 제품은 "모든 운영을 대체하는 플랫폼"이 아니다. 기존 사용 흐름을 최대한
유지하면서 반복 입력, 상태 확인, 누락 방지를 줄인다.

웹 UI, OCR provider, 회의록 분석/검색, 리포트 화면은 Discord bot workflow가
검증된 뒤 future issue로 재검토한다.

## Shared Principles

1. 하나의 Discord 서버에서 서비스별 채널을 나누어 운영한다.
2. SNS는 `#sns`, 영수증은 `#receipt`, Todo는 `#todo` 채널을 기본 운영 공간으로 둔다.
3. 로컬에 설치한 Discord bot이 세 서비스의 slash command와 파일 입력을 처리한다.
4. MVP bot stack은 `docs/tech-stack.md`를 따른다.
5. Google Sheets는 초기 운영 기록과 행정 담당자 협업을 위한 저장소로 둔다.
6. Web/mobile UI는 Discord에서 처리하기 어려운 긴 목록, 지도, 파일 관리가 필요할 때만 보조 surface로 둔다.
7. 각 서비스는 독립적으로 성공하거나 실패할 수 있어야 한다.
8. KakaoTalk 자동화는 MVP 범위에서 제외한다.
9. Google Sheets, 파일 저장, 외부 업로드 같은 작업은 2~3번 재시도한 뒤 최종 실패 안내를 반환하고 종료한다.

## Discord Server Layout

| Channel | Service | Main commands |
| --- | --- | --- |
| `#sns` | SNS 업로드 | `/post` |
| `#receipt` | 영수증 | `/receipt add`, `/receipt check`, `/receipt sheet status`, `/receipt sheet set` |
| `#todo` | Todo | `/todo add`, `/todo list`, `/todo status` |

## MVP Priority

1. Shared local bot foundation: Discord command registration, channel validation, SQLite config, retry handling.
2. 영수증: 로컬 Discord bot으로 영수증 사진을 저장하고, 송금 대기 상태를 Google Sheets에 남기며 `/receipt check`로 미완료 건수를 확인한다.
3. SNS 업로드: `#sns`에서 `/post`로 입력 수집과 결과 추적을 시작한다.
4. Todo: `#todo`에서 시작하되, 사용자 요구사항 확인 후 최소 명령어부터 구현한다.

## Shared Open Questions

1. 홈페이지 게시 API 또는 관리자 업로드 방식은 무엇인가?
2. Instagram/Facebook 자동 업로드는 Meta 권한 심사를 통과해야 하는가, 아니면 초기에는 수동 업로드 보조로 둘 것인가?
3. Google Sheets가 장기 source of truth인지, 임시 운영 장부인지 결정해야 한다.
4. Todo에서 Discord 명령만으로 충분한가, 아니면 지도/긴 리스트 때문에 보조 web/mobile UI가 필요한가?
